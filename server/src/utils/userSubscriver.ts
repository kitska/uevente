import { EventSubscriber, EntitySubscriberInterface, InsertEvent, RemoveEvent } from "typeorm";
import { User } from "../models/User";
import { Calendar } from "../models/Calendar";
import { Permission } from "../models/Permission";
import { seedLocalEventsForCountry } from "../database/data-source";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    listenTo() {
        return User;
    }

    async afterInsert(event: InsertEvent<User>) {
        console.log(`📌 User created: ${event.entity.id}`);
        const user = event.entity;

        const calendar = event.manager.create(Calendar, {
            name: user.fullName,
            description: "My personal calendar^^",
        });

        await event.manager.save(calendar);

        const permission = event.manager.create(Permission, {
            user: user,
            calendar: calendar,
            role: "owner",
        });

        await event.manager.save(permission);

        console.log(`✅ Personal calendar created for user: ${user.id}`);

        if (user.country) {
            await seedLocalEventsForCountry(user.country);

            const localCalendar = await event.manager.findOne(Calendar, {
                where: { name: `Holidays in ${user.country}` },
            });

            if (localCalendar) {
                const ownerPermission = event.manager.create(Permission, {
					user: user,
					calendar: localCalendar,
					role: "viewer"
				});
				await event.manager.save(ownerPermission);
                // await event.manager.save(localCalendar);
            }
        }
    }

    async beforeRemove(event: RemoveEvent<User>) {
        const user = event.databaseEntity;
        if (!user) {
            console.log("❌ User data not found in databaseEntity.");
            return;
        }

        console.log(`✅ Handling removal of user ${user.id}`);

        const manager = event.manager;

        // Find all permissions related to this user
        const permissions = await manager.find(Permission, {
            where: { user: user },
            relations: ["calendar"]
        });

        console.log(`📌 Found ${permissions?.length} permissions`);

        // Extract owned calendars
        const ownedCalendars = permissions
            .filter(p => p.role === "owner")
            .map(p => p.calendar);

        console.log(`📌 Found ${ownedCalendars?.length} owned calendars`);

        for (const ownedCalendar of ownedCalendars) {
            const calendar = await manager.findOne(Calendar, {
                where: { id: ownedCalendar.id },
                relations: ["permissions", "permissions.user"] // Ensure permissions are loaded here
            });
            // console.log(calendarr);

            const invitedUsers = calendar.permissions.filter(p => p.user.id !== user.id);

            if (invitedUsers?.length > 0) {
                // Assign new owner
                invitedUsers[0].role = "owner";
                await manager.save(invitedUsers[0]);
                console.log(`✅ Transferred ownership of calendar ${calendar.id}`);
            } else {
                // Delete orphaned calendar
                await manager.remove(calendar);
                console.log(`❌ Deleted calendar ${ownedCalendar.id}`);
            }
        }

        // Finally, delete all permissions for this user
        await manager.delete(Permission, { user: user });

        console.log(`✅ User ${user.id} deleted, permissions and calendars updated.`);
    }

}

// import { EventSubscriber, EntitySubscriberInterface, InsertEvent, RemoveEvent } from "typeorm";
// import { Calendar } from "../models/Calendar";
// import { User } from "../models/User";
// import { Permission } from "../models/Permission";

// @EventSubscriber()
// export class CalendarSubscriber implements EntitySubscriberInterface<Calendar> {
//     listenTo() {
//         return Calendar;
//     }

//     async afterInsert(event: InsertEvent<Calendar>) {
//         console.log(`📌 Calendar created: ${event.entity.id}`);
//         const calendar = event.entity;

//         // Получаем ownerId, если он был передан в контексте запроса
//         const ownerId = event.queryRunner.data?.ownerId;
//         if (!ownerId) {
//             console.log("❌ OwnerId not provided.");
//             return;
//         }



//ne robochee govnishe



//         const owner = await event.manager.findOne(User, { where: { id: ownerId } });
//         if (!owner) {
//             console.log("❌ Owner not found.");
//             return;
//         }

//         const ownerPermission = event.manager.create(Permission, {
//             user: owner,
//             calendar: calendar,
//             role: "owner"
//         });

//         await event.manager.save(ownerPermission);
//         console.log(`✅ Assigned owner (${owner.id}) to calendar: ${calendar.id}`);
//     }
// }

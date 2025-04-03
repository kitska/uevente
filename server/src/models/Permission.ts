import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from "typeorm";
import { User } from "./User";
// import { Permission } from "./Permission";
import { Calendar } from "./Calendar";
import { Event } from "./Event";

@Entity()
export class Permission extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, user => user.permissions)
    user: User;

    @ManyToOne(() => Calendar, { nullable: true, cascade: true, onDelete: "CASCADE" })
    calendar: Calendar;

    @ManyToOne(() => Event, { nullable: true, cascade: true, onDelete: "CASCADE" })
    event: Event;

    @Column({ default: "viewer" })
    role: "owner" | "editor" | "viewer" | "manager" | "mr.penis";  // или какое-то другое значение для роли
}

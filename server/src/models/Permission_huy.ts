// import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, BaseEntity, OneToMany } from "typeorm";
// import { User } from "./User";
// import { UserPermission } from "./Permission";

// @Entity()
// export class Permission extends BaseEntity {
//     @PrimaryGeneratedColumn("uuid")
//     id: string;

//     @Column({ default: "viewer" })
//     role: "owner" | "editor" | "viewer";  // или какое-то другое значение для роли

//     @Column({ type: "text" })
//     description: string;

//     @OneToMany(() => UserPermission, (userPermission) => userPermission.permission)
//     userPermissions: UserPermission[];
// }

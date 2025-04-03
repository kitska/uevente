import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, BaseEntity, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Calendar } from './Calendar';
// import { Permission } from "./Permission_huy";
import bcrypt from 'bcrypt';
import { Permission } from './Permission';

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	fullName: string;

	@Column({ unique: true })
	email: string;

	@Column({ unique: true })
	login: string;

	@Column({ nullable: true })
	country: string;

	@Column()
	password: string;

	@Column({ default: false })
	isEmailConfirmed: boolean;

	// @ManyToMany(() => Calendar, calendar => calendar.users)
	// calendars: Calendar[];

    @OneToMany(() => Permission, (permission) => permission.user)
    permissions: Permission[];

	// @BeforeUpdate()
	@BeforeInsert()
	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 10);
	}
}

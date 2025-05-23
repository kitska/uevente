import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	BeforeInsert
} from 'typeorm';
import bcrypt from 'bcrypt';
const defaultAvatars = [
	'face_1.png',
	'face_2.png',
	'face_3.png',
	'face_4.png',
	'face_5.png'
];
@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 255 })
	fullName: string;

	@Column({ length: 255, unique: true })
	email: string;

	@Column({ length: 255, unique: true })
	login: string;

	@Column()
	password: string;

	@Column({ nullable: true })
	profilePicture: string;

	@Column({ default: false })
	isAdmin: boolean;

	@Column({ default: true })
	isShowName: boolean;

	@Column({ default: 0 })
	rating: number;

	@Column({ length: 15, unique: true, nullable: true })
	phone: string;

	@Column({ default: false })
	isEmailConfirmed: boolean;

	@Column({ default: true })
	emailNotifications: boolean;

	@Column({ default: false })
	pushNotifications: boolean;

	@Column({ default: false })
	smsNotifications: boolean;

	@Column({ type: 'json', nullable: true })
	pushSubscription: any;


	@BeforeInsert()
	async initUser() {
		this.password = await bcrypt.hash(this.password, 10);
		if (!this.profilePicture) {
			const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
			this.profilePicture = `${process.env.BACK_URL || 'http://localhost:8000'}/avatars/${randomAvatar}`;
		}
	}
}


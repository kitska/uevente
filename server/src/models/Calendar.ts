import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, BaseEntity, BeforeInsert } from 'typeorm';
import { User } from './User';
import { Event } from './Event';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../database/data-source'; // Import AppDataSource or your connection source
import { Permission } from './Permission';

@Entity()
export class Calendar extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: "#fcba03" })
	color: string

    @OneToMany(() => Event, event => event.calendar, { cascade: true, onDelete: 'CASCADE' })
    events: Event[];

    @Column({ unique: true })
    inviteToken: string;

    @BeforeInsert()
    generateInviteToken() {
        this.inviteToken = randomUUID();
    }

    @OneToMany(() => Permission, (permission) => permission.calendar)
    permissions: Permission[];
}

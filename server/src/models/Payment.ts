import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from 'typeorm';
import { User } from './User';
import { Event } from './Event';
import { Promocode } from './Promocode';
@Entity()
export class Payment extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => User)
	user: User;

  	@ManyToOne(() => Event, { nullable: true, onDelete: 'SET NULL' })
  	event: Event;

	@ManyToOne(() => Promocode, { nullable: true })
	promocode: Promocode;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	amount: number;

	@Column({ type: 'int', nullable: true })
	quantity: number;

	@Column({ type: 'enum', enum: ['pending', 'successful', 'failed'] })
	status: string;
}
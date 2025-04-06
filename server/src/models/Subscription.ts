import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	BaseEntity,
} from 'typeorm';
import { User } from './User';
import { Event } from './Event';

@Entity()
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event)
  event: Event;

  @ManyToOne(() => User)
  user: User;
}
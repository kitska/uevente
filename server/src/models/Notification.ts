import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from 'typeorm';
import { User } from './User';
import { Event } from './Event';

@Entity()
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, { cascade: true, onDelete: 'CASCADE' })
  event: Event;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'enum', enum: ['email', 'web_push', 'phone'] })
  method: string;
}
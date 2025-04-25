import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity
} from 'typeorm';
import { User } from './User';
import { Event } from './Event';

@Entity()
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, { cascade: true, onDelete: 'CASCADE' })
  event: Event;

  @ManyToOne(() => User)
  user: User;

  @Column()
  qr_code: string;
}
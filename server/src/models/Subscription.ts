import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity,
} from 'typeorm';
import { User } from './User';
import { Event } from './Event';
import { Company } from './Company';

@Entity()
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, { nullable: true, cascade: true, onDelete: 'CASCADE' })
  event: Event;

  @ManyToOne(() => Company, { nullable: true, cascade: true, onDelete: 'CASCADE' })
  company: Company;

  @ManyToOne(() => User)
  user: User;
}
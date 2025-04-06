import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	BaseEntity,
} from 'typeorm';
import { Event } from './Event';

@Entity()
export class Promocode extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event)
  event: Event;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount: number;
}
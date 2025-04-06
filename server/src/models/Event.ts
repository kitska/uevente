import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	ManyToMany,
	JoinTable,
	BaseEntity,
} from 'typeorm';
import { Company } from './Company';
import { Format } from './Format';
import { Theme } from './Theme';

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company)
  company: Company;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price: number;

  @Column('text')
  location: string;

  @Column('timestamp')
  date: Date;

  @Column({ type: 'int', nullable: true })
  ticket_limit: number;

  @Column({ default: false })
  is_published: boolean;

  @Column({ nullable: true })
  poster: string;

  @ManyToMany(() => Format)
  @JoinTable({ name: "event_format" })
  formats: Format[];

  @ManyToMany(() => Theme)
  @JoinTable({ name: "event_theme" })
  themes: Theme[];
}


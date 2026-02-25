import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { User } from '../users/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'client_user_id' })
  client!: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'provider_user_id' })
  provider!: User;

  @Column({ type: 'int' })
  stars!: number; // 1..5

  @Column({ type: 'varchar', length: 800, nullable: true })
  comment?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
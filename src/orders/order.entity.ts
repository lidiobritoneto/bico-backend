import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type OrderStatus = 'new' | 'accepted' | 'in_progress' | 'done' | 'canceled';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.clientOrders, { eager: true })
  @JoinColumn({ name: 'client_user_id' })
  client!: User;

  @ManyToOne(() => User, (u) => u.providerOrders, { eager: true })
  @JoinColumn({ name: 'provider_user_id' })
  provider!: User;

  @Column({ type: 'varchar', length: 80 })
  categoryName!: string;

  @Column({ type: 'varchar', length: 900 })
  description!: string;

  @Column({ type: 'varchar', length: 80 })
  city!: string;

  @Column({ type: 'varchar', length: 2 })
  state!: string;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledFor?: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'new' })
  status!: OrderStatus;

  // Controle simples de "não lidas" por participante (MVP)
  @Column({ type: 'timestamptz', nullable: true })
  clientLastReadAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  providerLastReadAt?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
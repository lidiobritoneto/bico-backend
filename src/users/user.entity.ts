import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProviderProfile } from '../providers/provider-profile.entity';
import { Order } from '../orders/order.entity';
import { Message } from '../chat/message.entity';

export type UserRole = 'client' | 'provider';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 120 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  // Foto do perfil (base64 sem prefixo "data:")
  // MVP: armazenar no banco. Produção: salvar em storage (S3, etc.) e guardar URL.
  @Column({ type: 'text', nullable: true })
  avatarBase64?: string | null;

  @Column({ type: 'varchar', length: 20 })
  role!: UserRole;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @OneToOne(() => ProviderProfile, (p) => p.user)
  providerProfile?: ProviderProfile;

  @OneToMany(() => Order, (o) => o.client)
  clientOrders?: Order[];

  @OneToMany(() => Order, (o) => o.provider)
  providerOrders?: Order[];

  @OneToMany(() => Message, (m) => m.sender)
  messages?: Message[];
}
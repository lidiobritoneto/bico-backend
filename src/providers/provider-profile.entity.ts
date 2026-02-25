import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { ProviderCategory } from './provider-category.entity';

@Entity('provider_profiles')
export class ProviderProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (u) => u.providerProfile, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 500, default: '' })
  bio!: string;

  @Column({ type: 'varchar', length: 80 })
  city!: string;

  // ✅ IBGE city id (mais confiável do que nome)
  @Column({ type: 'int', nullable: true })
  cityId?: number | null;

  @Column({ type: 'varchar', length: 2 })
  state!: string;

  @Column({ type: 'float', default: 0 })
  lat!: number;

  @Column({ type: 'float', default: 0 })
  lng!: number;

  @Column({ type: 'int', default: 10 })
  serviceRadiusKm!: number;

  @Column({ type: 'float', default: 100 })
  priceBase!: number;

  @Column({ type: 'varchar', length: 20, default: 'por serviço' })
  priceType!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => ProviderCategory, (pc) => pc.providerProfile, { cascade: true })
  categories!: ProviderCategory[];

  @Column({ type: 'text', nullable: true })
  avatarBase64?: string | null;

  @Column({ type: 'float', default: 0 })
  ratingAvg!: number;

  @Column({ type: 'int', default: 0 })
  ratingCount!: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastSeenAt?: Date | null;
}
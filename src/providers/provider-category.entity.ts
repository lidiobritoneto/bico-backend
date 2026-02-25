import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';
import { Category } from './category.entity';

@Entity('provider_categories')
export class ProviderCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ProviderProfile, (p) => p.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_profile_id' })
  providerProfile!: ProviderProfile;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';
import { Category } from './category.entity';
import { ProviderCategory } from './provider-category.entity';
import { User } from '../users/user.entity';
import { UpsertProviderProfileDto } from './dto/upsert-provider-profile.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(ProviderProfile) private readonly profiles: Repository<ProviderProfile>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(ProviderCategory) private readonly providerCats: Repository<ProviderCategory>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async upsertProfile(userId: string, dto: UpsertProviderProfileDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuário não encontrado.');
    if (user.role !== 'provider') throw new BadRequestException('Usuário não é prestador.');

    let profile = await this.profiles.findOne({
      where: { user: { id: userId } as any },
      relations: ['categories', 'categories.category'],
    });

    if (!profile) {
      profile = this.profiles.create({
        user,
        city: dto.city,
        cityId: dto.cityId ?? null,
        state: dto.state,
        bio: dto.bio ?? '',
        lat: dto.lat ?? 0,
        lng: dto.lng ?? 0,
        serviceRadiusKm: dto.serviceRadiusKm ?? 10,
        priceBase: dto.priceBase ?? 100,
        priceType: dto.priceType ?? 'por serviço',
        isActive: dto.isActive ?? true,
        avatarBase64: dto.avatarBase64?.trim() ? dto.avatarBase64 : null,
        categories: [],
      });
      profile = await this.profiles.save(profile);
    } else {
      profile.city = dto.city;
      if (dto.cityId !== undefined) profile.cityId = dto.cityId ?? null;
      profile.state = dto.state;
      profile.bio = dto.bio ?? profile.bio;
      profile.lat = dto.lat ?? profile.lat;
      profile.lng = dto.lng ?? profile.lng;
      profile.serviceRadiusKm = dto.serviceRadiusKm ?? profile.serviceRadiusKm;
      profile.priceBase = dto.priceBase ?? profile.priceBase;
      profile.priceType = dto.priceType ?? profile.priceType;
      profile.isActive = dto.isActive ?? profile.isActive;
      if (dto.avatarBase64 !== undefined) {
        const v = dto.avatarBase64?.trim();
        profile.avatarBase64 = v ? v : null;
      }
      await this.profiles.save(profile);

      await this.providerCats.delete({ providerProfile: { id: profile.id } as any });
    }

    const catEntities: Category[] = [];
    for (const nameRaw of dto.categories) {
      const raw = (nameRaw ?? '').toString().trim();
      if (!raw) continue;

      // ✅ Normaliza para não duplicar categoria por diferença de maiúsculas/minúsculas (Postgres)
      const normalized = raw.toLowerCase();

      // Tenta encontrar por comparação case-insensitive
      let cat = await this.categories
        .createQueryBuilder('c')
        .where('LOWER(c.name) = :normalized', { normalized })
        .getOne();

      if (!cat) {
        // Salva um nome bonitinho (Title Case) pro app, mas a busca é por LOWER()
        const display = raw
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');

        cat = await this.categories.save(this.categories.create({ name: display }));
      }

      catEntities.push(cat);
    }

    const joins = catEntities.map((cat) =>
      this.providerCats.create({ providerProfile: profile, category: cat }),
    );
    await this.providerCats.save(joins);

    const full = await this.profiles.findOne({
      where: { id: profile.id },
      relations: ['categories', 'categories.category', 'user'],
    });

    return this.serializeProfile(full!);
  }

  async listProviders(params: { city?: string; state?: string; cityId?: number; category?: string }) {
    const city = params.city?.trim();
    const state = params.state?.trim();
    const category = params.category?.trim();

    const cityId =
      params.cityId !== undefined && params.cityId !== null && Number.isFinite(Number(params.cityId))
        ? Number(params.cityId)
        : undefined;

    const qb = this.profiles
      .createQueryBuilder('p')
      .distinct(true)
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.categories', 'pc')
      .leftJoinAndSelect('pc.category', 'c')
      .where('p.isActive = true');

    // Filtro por localização (prefere cityId)
    if (cityId !== undefined) {
      qb.andWhere('p.cityId = :cityId', { cityId });
      if (state) qb.andWhere('p.state ILIKE :state', { state });
    } else {
      if (city) qb.andWhere('p.city ILIKE :city', { city });
      if (state) qb.andWhere('p.state ILIKE :state', { state });
    }

    // Categoria/qualificação: pesquisa parcial e case-insensitive (Postgres)
    if (category) {
      qb.andWhere('c.name ILIKE :cat', { cat: `%${category}%` });
    }

    const profiles = await qb.getMany();
    return profiles.map((p) => this.serializeProfile(p));
  }

  async getProviderByUserId(userId: string) {
    const p = await this.profiles.findOne({
      where: { user: { id: userId } as any },
      relations: ['user', 'categories', 'categories.category'],
    });
    if (!p) throw new BadRequestException('Perfil de prestador não encontrado.');
    return this.serializeProfile(p);
  }

  async getProviderPublic(providerUserId: string) {
    const p = await this.profiles.findOne({
      where: { user: { id: providerUserId } as any },
      relations: ['user', 'categories', 'categories.category'],
    });
    if (!p) throw new BadRequestException('Prestador não encontrado.');
    return this.serializeProfile(p);
  }

  private serializeProfile(p: ProviderProfile) {
    return {
      userId: p.user.id,
      name: p.user.name,
      city: p.city,
      cityId: p.cityId ?? null,
      state: p.state,
      bio: p.bio,
      lat: p.lat,
      lng: p.lng,
      serviceRadiusKm: p.serviceRadiusKm,
      priceBase: p.priceBase,
      priceType: p.priceType,
      isActive: p.isActive,
      avatarBase64: p.avatarBase64 ?? null,
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
      categories: (p.categories ?? []).map((x) => x.category.name),
    };
  }
}
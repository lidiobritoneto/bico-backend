import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderProfile } from '../providers/provider-profile.entity';

@Injectable()
export class PresenceService {
  constructor(@InjectRepository(ProviderProfile) private readonly profiles: Repository<ProviderProfile>) {}

  async pingProvider(userId: string) {
    const profile = await this.profiles.findOne({ where: { user: { id: userId } as any } });
    if (!profile) return { ok: true }; // prestador sem perfil ainda
    profile.lastSeenAt = new Date();
    await this.profiles.save(profile);
    return { ok: true, lastSeenAt: profile.lastSeenAt };
  }
}
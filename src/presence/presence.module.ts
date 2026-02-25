import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderProfile } from '../providers/provider-profile.entity';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderProfile])],
  controllers: [PresenceController],
  providers: [PresenceService],
})
export class PresenceModule {}
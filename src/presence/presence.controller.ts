import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { PresenceService } from './presence.service';

@Controller('presence')
export class PresenceController {
  constructor(private readonly presence: PresenceService) {}

  @UseGuards(JwtGuard)
  @Post('ping')
  ping(@Req() req: any) {
    if (req.user.role !== 'provider') return { ok: true };
    return this.presence.pingProvider(req.user.id);
  }
}
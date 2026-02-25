import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  async me(@Req() req: any) {
    const u = await this.users.findById(req.user.id);
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      avatarBase64: u.avatarBase64,
    };
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
    const u = await this.users.updateMe(req.user.id, {
      name: dto.name,
      phone: dto.phone ?? null,
      avatarBase64: dto.avatarBase64 ?? null,
    });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      avatarBase64: u.avatarBase64,
    };
  }
}

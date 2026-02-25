import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { ProvidersService } from './providers.service';
import { UpsertProviderProfileDto } from './dto/upsert-provider-profile.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providers: ProvidersService) {}

  // ⚠️ rotas específicas primeiro (evita conflito com ":providerUserId")
  @UseGuards(JwtGuard)
  @Get('me/profile')
  myProfile(@Req() req: any) {
    if (req.user.role !== 'provider') throw new ForbiddenException('Somente prestador.');
    return this.providers.getProviderByUserId(req.user.id);
  }

  @Get()
  list(
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('cityId') cityId?: string,
    @Query('category') category?: string,
    @Query('qualification') qualification?: string,
  ) {
    const parsedCityId = cityId !== undefined && cityId !== null && cityId !== '' ? Number(cityId) : undefined;
    const safeCityId = parsedCityId !== undefined && Number.isFinite(parsedCityId) ? parsedCityId : undefined;

    const cat = (category ?? qualification)?.trim();

    return this.providers.listProviders({
      city,
      state,
      cityId: safeCityId,
      category: cat,
    });
  }

  @Get(':providerUserId')
  get(@Param('providerUserId') providerUserId: string) {
    return this.providers.getProviderPublic(providerUserId);
  }

  @UseGuards(JwtGuard)
  @Post('me')
  upsertMe(@Req() req: any, @Body() dto: UpsertProviderProfileDto) {
    if (req.user.role !== 'provider') throw new ForbiddenException('Somente prestador.');
    if (!dto) throw new BadRequestException('Body inválido.');
    return this.providers.upsertProfile(req.user.id, dto);
  }
}

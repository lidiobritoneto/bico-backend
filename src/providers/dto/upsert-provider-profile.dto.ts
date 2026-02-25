import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpsertProviderProfileDto {
  @IsString()
  city!: string;

  // ✅ IBGE city id (opcional)
  @IsOptional()
  @IsInt()
  @Min(1)
  cityId?: number;

  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  serviceRadiusKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceBase?: number;

  @IsOptional()
  @IsString()
  priceType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // ✅ NOVO: foto do prestador (base64)
  // Obs: pode ser string grande, por enquanto ok no MVP
  @IsOptional()
  @IsString()
  avatarBase64?: string;

  @IsArray()
  categories!: string[];
}
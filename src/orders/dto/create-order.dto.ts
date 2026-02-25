import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  providerUserId!: string;

  @IsString()
  categoryName!: string;

  @IsString()
  description!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  scheduledForIso?: string;
}
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWalkInCampaignDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  profile?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

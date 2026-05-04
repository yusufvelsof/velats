import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class ExperienceDto {
  @IsString({ message: 'Title must be a text value' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Company must be a text value' })
  @IsOptional()
  company?: string;

  @IsString({ message: 'Summary must be a text value' })
  @IsOptional()
  summary?: string;

  @IsString({ message: 'From month must be a text value' })
  @IsOptional()
  fromMonth?: string;

  @IsString({ message: 'From year must be a text value' })
  @IsOptional()
  fromYear?: string;

  @IsString({ message: 'To month must be a text value' })
  @IsOptional()
  toMonth?: string;

  @IsString({ message: 'To year must be a text value' })
  @IsOptional()
  toYear?: string;

  @IsBoolean({ message: 'Current status must be a boolean' })
  @IsOptional()
  isCurrent?: boolean;
}

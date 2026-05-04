import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class EducationDto {
  @IsString({ message: 'Institute must be a text value' })
  @IsOptional()
  institute?: string;

  @IsString({ message: 'Major must be a text value' })
  @IsOptional()
  major?: string;

  @IsString({ message: 'Degree must be a text value' })
  @IsOptional()
  degree?: string;

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

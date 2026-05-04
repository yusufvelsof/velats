import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailTemplateDto } from './create-email-template.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEmailTemplateDto extends PartialType(CreateEmailTemplateDto) {
  @IsString()
  @IsOptional()
  reason?: string;
}

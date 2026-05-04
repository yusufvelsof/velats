import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsJSON } from 'class-validator';

export class CreateEmailTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  module?: string;

  @IsString()
  @IsOptional()
  cc?: string;

  @IsString()
  @IsOptional()
  bcc?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  signature?: string;

  @IsString()
  @IsOptional()
  defaultFromEmail?: string;

  @IsBoolean()
  @IsOptional()
  addSignature?: boolean;

  @IsOptional()
  attachments?: any;
}

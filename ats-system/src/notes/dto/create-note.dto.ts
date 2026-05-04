import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsNotEmpty()
  candidateId: number;

  @IsInt()
  @IsOptional()
  applicationId?: number;

  @IsInt()
  @IsOptional()
  userId?: number;
}

import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsInt({ message: 'Candidate ID must be an integer' })
  @IsNotEmpty({ message: 'Candidate selection is required' })
  candidateId: number;

  @IsInt({ message: 'Job ID must be an integer' })
  @IsNotEmpty({ message: 'Job selection is required' })
  jobId: number;

  @IsString({ message: 'Status must be a text value' })
  @IsNotEmpty({ message: 'Application status is required' })
  status: string;
}

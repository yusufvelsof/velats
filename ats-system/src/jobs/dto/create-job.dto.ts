import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateJobDto {
  @IsString({ message: 'Title must be a text value' })
  @IsNotEmpty({ message: 'Job title is required' })
  title: string;

  @IsString({ message: 'Description must be a text value' })
  @IsNotEmpty({ message: 'Job description is required' })
  description: string;

  @IsString({ message: 'Location must be a text value' })
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @IsString({ message: 'Status must be a text value' })
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  hiringManager?: string;

  @IsString()
  @IsOptional()
  assignedRecruiter?: string;

  @IsString()
  @IsOptional()
  postedBy?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  numPositions?: number;

  @IsString()
  @IsOptional()
  jobType?: string;

  @IsString()
  @IsOptional()
  experience?: string;

  @IsString()
  @IsOptional()
  salaryRange?: string;

  @IsString()
  @IsOptional()
  requiredSkills?: string;

  @IsString()
  @IsOptional()
  interviewMode?: string;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  benefits?: string;
}

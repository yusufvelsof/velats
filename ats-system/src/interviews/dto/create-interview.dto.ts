import { IsNotEmpty, IsOptional, IsString, IsInt, IsDateString } from 'class-validator';

export class CreateInterviewDto {
  @IsInt({ message: 'Application ID must be an integer' })
  @IsNotEmpty({ message: 'Application selection is required' })
  applicationId: number;

  @IsString({ message: 'Interview round must be a text value' })
  @IsNotEmpty({ message: 'Interview round (e.g. L1, R1) is required' })
  round: string;

  @IsDateString({}, { message: 'Please provide a valid start date and time' })
  @IsNotEmpty({ message: 'Interview start date/time is required' })
  date: string;

  @IsDateString({}, { message: 'Please provide a valid end time' })
  @IsNotEmpty({ message: 'Interview end time is required' })
  endTime: string;

  @IsInt({ message: 'Interviewer ID must be an integer' })
  @IsNotEmpty({ message: 'Please assign an interviewer' })
  interviewerId: number;

  @IsInt({ message: 'Owner ID must be an integer' })
  @IsNotEmpty({ message: 'Please assign an interview owner' })
  @IsOptional()
  ownerId?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  reminder?: string;

  @IsString({ message: 'Status must be a text value' })
  @IsOptional()
  status?: string;

  @IsString({ message: 'Feedback must be a text value' })
  @IsOptional()
  feedback?: string;

  @IsInt({ message: 'Rating must be an integer' })
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  subReason?: string;
}

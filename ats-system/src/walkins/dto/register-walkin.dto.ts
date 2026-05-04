import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterWalkInDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+-\s]{10,15}$/, { message: 'Please enter a valid mobile number' })
  mobile: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsOptional()
  currentLocation?: string;

  @IsString()
  @IsOptional()
  currentState?: string;

  @IsString()
  @IsOptional()
  currentCity?: string;

  @IsString()
  @IsOptional()
  hometown?: string;

  @IsString()
  @IsOptional()
  hometownState?: string;

  @IsString()
  @IsOptional()
  hometownCity?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  profile?: string;

  // Education Details
  @IsString()
  @IsOptional()
  tenthPercentage?: string;

  @IsString()
  @IsOptional()
  tenthYear?: string;

  @IsString()
  @IsOptional()
  twelfthPercentage?: string;

  @IsString()
  @IsOptional()
  twelfthYear?: string;

  @IsString()
  @IsOptional()
  graduationDegree?: string;

  @IsString()
  @IsOptional()
  graduationYear?: string;

  @IsString()
  @IsOptional()
  graduationPercentage?: string;

  @IsString()
  @IsOptional()
  graduationCollege?: string;

  @IsString()
  @IsOptional()
  pgDegree?: string;

  @IsString()
  @IsOptional()
  pgYear?: string;

  @IsString()
  @IsOptional()
  pgPercentage?: string;

  @IsString()
  @IsOptional()
  pgCollege?: string;

  // Experience
  @IsString()
  @IsOptional()
  experienceType?: string;

  @IsString()
  @IsOptional()
  experienceDuration?: string;

  @IsString()
  @IsOptional()
  roleDescription?: string;

  // Conditional Fields
  @IsString()
  @IsOptional()
  prevCompanyName?: string;

  @IsString()
  @IsOptional()
  prevDesignation?: string;

  @IsString()
  @IsOptional()
  currentCTC?: string;

  @IsString()
  @IsOptional()
  expectedCTC?: string;

  @IsString()
  @IsOptional()
  noticePeriod?: string;

  @IsString()
  @IsOptional()
  reasonForChange?: string;

  @IsString()
  @IsOptional()
  projectURL?: string;

  // Technical
  @IsString()
  @IsOptional()
  technologies?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'DB Proficiency must be at least 1' })
  @Max(5, { message: 'DB Proficiency cannot exceed 5' })
  @IsOptional()
  dbProficiency?: number;

  @IsString()
  @IsOptional()
  whyFit?: string;

  @IsOptional()
  force?: string;
}

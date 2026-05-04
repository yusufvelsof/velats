import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { EducationDto } from './education.dto';
import { ExperienceDto } from './experience.dto';

export class CreateCandidateDto {
  @IsString({ message: 'Name must be a text value' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Salutation must be selected' })
  @IsOptional()
  salutation?: string;

  @IsString({ message: 'First name must be a text value' })
  @IsOptional()
  firstName?: string;

  @IsString({ message: 'Last name is required' })
  @IsNotEmpty({ message: 'Please provide a last name' })
  lastName: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Mobile number is required' })
  @IsNotEmpty({ message: 'Please provide a mobile number' })
  mobile: string;

  @IsString({ message: 'Address Line 1 must be a text value' })
  @IsOptional()
  addressLine1?: string;

  @IsString({ message: 'Aptitude paper set must be a text value' })
  @IsOptional()
  aptitudePaperSet?: string;

  @IsInt({ message: 'Aptitude marks must be an integer' })
  @IsOptional()
  aptitudeMarks?: number;

  @IsInt({ message: 'Technical marks must be an integer' })
  @IsOptional()
  techMarks?: number;

  @IsInt({ message: 'Total marks must be an integer' })
  @IsOptional()
  totalMarks?: number;

  @IsString({ message: 'Area must be a text value' })
  @IsOptional()
  area?: string;

  @IsString({ message: 'City must be a text value' })
  @IsOptional()
  city?: string;

  @IsString({ message: 'State must be a text value' })
  @IsOptional()
  state?: string;

  @IsString({ message: 'Zip Code must be a text value' })
  @IsOptional()
  zipCode?: string;

  @IsString({ message: 'Experience years must be a valid number string' })
  @IsOptional()
  experienceYears?: string;

  @IsString({ message: 'Highest qualification must be a text value' })
  @IsOptional()
  highestQualification?: string;

  @IsString({ message: 'Expected salary must be a valid number string' })
  @IsOptional()
  expectedSalary?: string;

  @IsString({ message: 'Current employer must be a text value' })
  @IsOptional()
  currentEmployer?: string;

  @IsString({ message: 'Current job title must be a text value' })
  @IsOptional()
  currentJobTitle?: string;

  @IsString({ message: 'Current salary must be a valid number string' })
  @IsOptional()
  currentSalary?: string;

  @IsString({ message: 'Skill set must be a text value' })
  @IsOptional()
  skillSet?: string;

  @IsString({ message: 'Additional info must be a text value' })
  @IsOptional()
  additionalInfo?: string;

  @IsString({ message: 'Status must be a text value' })
  @IsOptional()
  status?: string;

  @IsString({ message: 'Source must be a text value' })
  @IsOptional()
  source?: string;

  @IsString({ message: 'Resume URL must be a text value' })
  @IsOptional()
  resumeUrl?: string;

  @IsString({ message: 'Gender must be a text value' })
  @IsOptional()
  gender?: string;

  @IsString({ message: 'Current location must be a text value' })
  @IsOptional()
  currentLocation?: string;

  @IsString({ message: 'Current state must be a text value' })
  @IsOptional()
  currentState?: string;

  @IsString({ message: 'Current city must be a text value' })
  @IsOptional()
  currentCity?: string;

  @IsString({ message: 'Hometown must be a text value' })
  @IsOptional()
  hometown?: string;

  @IsString({ message: 'Hometown state must be a text value' })
  @IsOptional()
  hometownState?: string;

  @IsString({ message: 'Hometown city must be a text value' })
  @IsOptional()
  hometownCity?: string;

  @IsString({ message: 'Tenth percentage must be a valid number string' })
  @IsOptional()
  tenthPercentage?: string;

  @IsString({ message: 'Tenth year must be a valid year' })
  @IsOptional()
  tenthYear?: string;

  @IsString({ message: 'Twelfth percentage must be a valid number string' })
  @IsOptional()
  twelfthPercentage?: string;

  @IsString({ message: 'Twelfth year must be a valid year' })
  @IsOptional()
  twelfthYear?: string;

  @IsString({ message: 'Graduation degree must be a text value' })
  @IsOptional()
  graduationDegree?: string;

  @IsString({ message: 'Graduation year must be a valid year' })
  @IsOptional()
  graduationYear?: string;

  @IsString({ message: 'Graduation percentage must be a valid number string' })
  @IsOptional()
  graduationPercentage?: string;

  @IsString({ message: 'Graduation college must be a text value' })
  @IsOptional()
  graduationCollege?: string;

  @IsString({ message: 'PG degree must be a text value' })
  @IsOptional()
  pgDegree?: string;

  @IsString({ message: 'PG year must be a valid year' })
  @IsOptional()
  pgYear?: string;

  @IsString({ message: 'PG percentage must be a valid number string' })
  @IsOptional()
  pgPercentage?: string;

  @IsString({ message: 'PG college must be a text value' })
  @IsOptional()
  pgCollege?: string;

  @IsString({ message: 'Experience type must be a text value' })
  @IsOptional()
  experienceType?: string;

  @IsString({ message: 'Experience duration must be a valid duration string' })
  @IsOptional()
  experienceDuration?: string;

  @IsString({ message: 'Role description must be a text value' })
  @IsOptional()
  roleDescription?: string;

  @IsString({ message: 'Previous company name must be a text value' })
  @IsOptional()
  prevCompanyName?: string;

  @IsString({ message: 'Previous designation must be a text value' })
  @IsOptional()
  prevDesignation?: string;

  @IsString({ message: 'Current CTC must be a valid number string' })
  @IsOptional()
  currentCTC?: string;

  @IsString({ message: 'Expected CTC must be a valid number string' })
  @IsOptional()
  expectedCTC?: string;

  @IsString({ message: 'Notice period must be a text value' })
  @IsOptional()
  noticePeriod?: string;

  @IsString({ message: 'Reason for change must be a text value' })
  @IsOptional()
  reasonForChange?: string;

  @IsString({ message: 'Project URL must be a valid URL string' })
  @IsOptional()
  projectURL?: string;

  @IsString({ message: 'Technologies must be a text value' })
  @IsOptional()
  technologies?: string;

  @IsInt({ message: 'DB proficiency must be an integer' })
  @IsOptional()
  dbProficiency?: number;

  @IsString({ message: 'Why fit must be a text value' })
  @IsOptional()
  whyFit?: string;

  @IsInt({ message: 'Owner ID must be a valid user ID' })
  @IsOptional()
  ownerId?: number;

  @IsString({ message: 'LinkedIn URL must be a text value' })
  @IsOptional()
  linkedin?: string;

  @IsString({ message: 'Facebook URL must be a text value' })
  @IsOptional()
  facebook?: string;

  @IsString({ message: 'Instagram URL must be a text value' })
  @IsOptional()
  instagram?: string;

  @IsString({ message: 'Other social URL must be a text value' })
  @IsOptional()
  otherSocial?: string;

  @IsInt({ message: 'Job ID must be a valid job ID' })
  @IsOptional()
  jobId?: number;

  @IsArray({ message: 'Education must be an array' })
  @IsOptional()
  @Type(() => EducationDto)
  education?: EducationDto[];

  @IsArray({ message: 'Experience must be an array' })
  @IsOptional()
  @Type(() => ExperienceDto)
  experience?: ExperienceDto[];
}

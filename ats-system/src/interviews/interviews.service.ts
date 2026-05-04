import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    private activityLogsService: ActivityLogsService,
    private emailService: EmailService,
  ) {}

  private async triggerInterviewEmail(slug: string, interview: any) {
    const candidate = interview.application?.candidate;
    if (!candidate?.email) {
      console.warn(`[Email Trigger Skipped] No email found for candidate in interview ${interview.id}`);
      return;
    }

    try {
      const job = interview.application.job;
      const interviewer = interview.interviewerUser;
      
      // Locale-aware formatting (en-IN)
      const formattedDateTime = new Date(interview.date).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata'
      });

      await this.emailService.sendTemplateEmail({
        slug,
        to: candidate.email,
        candidateId: candidate.id,
        userId: interview.ownerId,
        emailType: 'interview',
        variables: {
          candidate_name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.name,
          job_title: job.title,
          interview_level: (interview.round || 'Initial Round').replace(/_/g, ' '),
          interview_date_time: formattedDateTime,
          location: interview.location || 'Online / Link to be shared',
          interviewer_name: interviewer ? `${interviewer.firstName} ${interviewer.lastName}` : 'TBD'
        }
      });
    } catch (error) {
      console.error(
        `[Email Trigger Failed] Slug: ${slug}, InterviewId: ${interview.id}, CandidateId: ${candidate?.id}, Error: ${error.message}`
      );
    }
  }

  async create(createInterviewDto: CreateInterviewDto): Promise<Interview> {
    const { date, endTime, ...rest } = createInterviewDto;
    const interview = await this.prisma.interview.create({
      data: {
        ...rest,
        date: new Date(date),
        endTime: endTime ? new Date(endTime) : null,
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        interviewerUser: true,
      },
    });

    // Update Application status to INTERVIEW
    await this.prisma.application.update({
      where: { id: interview.applicationId },
      data: { status: 'INTERVIEW' },
    });

    await this.activityLogsService.create({
      action: 'SCHEDULED',
      entityType: 'INTERVIEW',
      entityId: interview.id,
      description: `${interview.round} scheduled for ${interview.application.candidate.name} on ${interview.date}.`,
    });

    // Trigger Email
    await this.triggerInterviewEmail('interview-scheduled', interview);

    return interview;
  }

  async findAll(): Promise<Interview[]> {
    return this.prisma.interview.findMany({
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        interviewerUser: true,
        owner: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        interviewerUser: true,
        owner: true,
      },
    });
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
    return interview;
  }

  async update(id: number, updateInterviewDto: UpdateInterviewDto): Promise<Interview> {
    const { date, endTime, ...rest } = updateInterviewDto;
    try {
      const oldInterview = await this.findOne(id);
      const isRescheduled = date && new Date(date).getTime() !== oldInterview.date.getTime();
      const isLocationChanged = rest.location && rest.location !== oldInterview.location;
      const isRoundChanged = rest.round && rest.round !== oldInterview.round;
      const isCancelled = rest.status === 'CANCELLED' && oldInterview.status !== 'CANCELLED';

      const interview = await this.prisma.interview.update({
        where: { id },
        data: {
          ...rest,
          ...(date && { date: new Date(date) }),
          ...(endTime && { endTime: new Date(endTime) }),
        },
        include: {
          application: {
            include: { candidate: true, job: true }
          },
          interviewerUser: true,
        }
      });

      if ((isRescheduled || isLocationChanged || isRoundChanged) && interview.status !== 'CANCELLED') {
        await this.triggerInterviewEmail('interview-rescheduled', interview);
      } else if (isCancelled) {
        await this.triggerInterviewEmail('interview-cancelled', interview);
      }

      return interview;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
  }

  async remove(id: number): Promise<Interview> {
    try {
      const interview = await this.findOne(id);
      
      const deletedInterview = await this.prisma.interview.delete({
        where: { id },
      });

      // Send cancellation email after successful deletion if not already cancelled
      if (interview.status !== 'CANCELLED') {
        await this.triggerInterviewEmail('interview-cancelled', interview);
      }

      return deletedInterview;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
  }
}

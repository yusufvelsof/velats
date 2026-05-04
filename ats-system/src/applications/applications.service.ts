import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    return this.prisma.application.create({
      data: createApplicationDto,
    });
  }

  async findAll(status?: string, jobId?: number): Promise<Application[]> {
    const where: any = {
      candidate: {
        deletedAt: null
      }
    };
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;

    return this.prisma.application.findMany({
      where,
      include: {
        candidate: true,
        job: true,
      },
    });
  }

  async findOne(id: number): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
        interviews: true,
      },
    });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  async update(id: number, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
    try {
      const oldApplication = await this.findOne(id);
      
      const application = await this.prisma.application.update({
        where: { id },
        data: updateApplicationDto,
        include: {
          candidate: true,
          job: true,
        },
      });

      const oldStatus = oldApplication.status;
      const newStatus = updateApplicationDto.status;

      // Duplicate protection: trigger only on actual change
      if (newStatus && oldStatus !== newStatus) {
        await this.triggerStatusEmail(newStatus, application);
      }

      if (updateApplicationDto.status) {
        await this.activityLogsService.create({
          action: 'STATUS_CHANGED',
          entityType: 'APPLICATION',
          entityId: application.id,
          description: `Application status for ${application.candidate.name} updated to ${application.status}.`,
        });
      }

      return application;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to update application: ${error.message}`);
    }
  }

  private async triggerStatusEmail(status: string, application: any) {
    try {
      const candidate = application.candidate;
      const job = application.job;

      if (!candidate?.email) return;

      let slug = '';

      switch (status) {
        case 'SHORTLISTED':
          slug = 'candidate-shortlisted';
          break;
        case 'REJECTED':
          slug = 'candidate-rejected';
          break;
        case 'HIRED':
          slug = 'candidate-hired';
          break;
        case 'OFFER':
          slug = 'candidate-offer';
          break;
        default:
          return;
      }

      await this.emailService.sendTemplateEmail({
        slug,
        to: candidate.email,
        candidateId: candidate.id,
        userId: application.userId || application.ownerId || 1, // Fallback userId
        emailType: 'status_change',
        variables: {
          candidate_name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.name || 'Candidate',
          job_title: job?.title || 'Open Position', // Null safety fallback
          company_name: 'Velocity Software Solutions Pvt. Ltd.'
        }
      });
    } catch (error) {
      console.error('[Status Email Failed]', {
        applicationId: application.id,
        candidateId: application.candidate?.id,
        status, // Improved error logging
        error: error.message
      });
    }
  }

  async remove(id: number): Promise<Application> {
    try {
      return await this.prisma.application.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
  }
}

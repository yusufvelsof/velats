import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalkInCampaignDto } from './dto/create-campaign.dto';
import { RegisterWalkInDto } from './dto/register-walkin.dto';
import { startOfDay, endOfDay } from 'date-fns';
import { EmailService } from '../email/email.service';

@Injectable()
export class WalkinsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async createCampaign(dto: CreateWalkInCampaignDto) {
    return this.prisma.walkInCampaign.create({
      data: dto,
    });
  }

  async getCampaigns() {
    return this.prisma.walkInCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });
  }

  async getCampaignById(id: number) {
    const campaign = await this.prisma.walkInCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async updateCampaign(id: number, data: Partial<CreateWalkInCampaignDto>) {
    return this.prisma.walkInCampaign.update({
      where: { id },
      data,
    });
  }

  async deleteCampaign(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Find all registration IDs for this campaign
      const registrations = await tx.walkInRegistration.findMany({
        where: { campaignId: id },
        select: { id: true }
      });
      const regIds = registrations.map(r => r.id);

      // 2. Delete associated rounds, paper tracking, and slot bookings
      if (regIds.length > 0) {
        await tx.walkInRound.deleteMany({
          where: { registrationId: { in: regIds } }
        });
        await tx.paperTracking.deleteMany({
          where: { registrationId: { in: regIds } }
        });
        await tx.slotBooking.deleteMany({
          where: { walkinRegistrationId: { in: regIds } }
        });
      }

      // 3. Delete registrations
      await tx.walkInRegistration.deleteMany({
        where: { campaignId: id }
      });

      // 4. Delete the campaign itself
      return tx.walkInCampaign.delete({
        where: { id }
      });
    });
  }

  async deleteRegistration(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete associated rounds and paper tracking
      await tx.walkInRound.deleteMany({
        where: { registrationId: id }
      });
      await tx.paperTracking.deleteMany({
        where: { registrationId: id }
      });

      // 2. Delete slot bookings associated with this registration
      await tx.slotBooking.deleteMany({
        where: { walkinRegistrationId: id }
      });

      // 3. Delete the registration itself
      return tx.walkInRegistration.delete({
        where: { id }
      });
    });
  }

  async register(campaignId: number, dto: RegisterWalkInDto, files: { resume?: string; photo?: string; certificate?: string }) {
    const { force, ...registerData } = dto;

    if (force !== 'true') {
      // Check in Walk-in Registrations
      const existingReg = await this.prisma.walkInRegistration.findFirst({
        where: {
          OR: [
            { email: dto.email },
            { mobile: dto.mobile }
          ]
        }
      });

      if (existingReg) {
        throw new ConflictException('Candidate already registered for a walk-in.');
      }

      // Check in main Candidate pool
      const existingCand = await this.prisma.candidate.findFirst({
        where: {
          OR: [
            { email: dto.email },
            { phone: dto.mobile }
          ]
        }
      });

      if (existingCand) {
        throw new ConflictException('Candidate already exists in our talent directory.');
      }
    }

    return this.prisma.walkInRegistration.create({
      data: {
        ...registerData,
        campaignId,
        resumeUrl: files.resume,
        photoUrl: files.photo,
        certificateUrl: files.certificate,
      },
    });
  }

  async getRegistrations(campaignId: number, query: any) {
    const { search, status, dateFrom, dateTo } = query;
    
    const where: any = { campaignId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = startOfDay(new Date(dateFrom));
      if (dateTo) where.createdAt.lte = endOfDay(new Date(dateTo));
    }

    return this.prisma.walkInRegistration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        rounds: true,
        paperTracking: true,
        slotBookings: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async updateAptitude(id: number, data: { aptitudeMarks: number; techMarks: number; isShortlistedAptitude: boolean; aptitudePaperSet?: string }) {
    const totalMarks = data.aptitudeMarks + data.techMarks;
    
    // Update Walk-in record
    const registration = await this.prisma.walkInRegistration.update({
      where: { id },
      data: {
        ...data,
        totalMarks,
        status: data.isShortlistedAptitude ? 'SHORTLISTED_APTI' : 'REGISTERED',
      },
      include: { campaign: true }
    });

    // Send automated email for shortlist
    if (data.isShortlistedAptitude) {
      await this.emailService.sendEmail(
        registration.email,
        `Application Shortlisted - ${registration.campaign.title}`,
        `Hi ${registration.name},\n\nCongratulations! You have been shortlisted in the initial assessment of our walk-in drive for "${registration.campaign.title}".\n\nOur team will contact you soon for the next steps.\n\nRegards,\nRecruitment Team`
      );
    }

    // If shortlisted, promote to Candidates table
    if (data.isShortlistedAptitude && !registration.candidateId) {
      let candidate = await this.prisma.candidate.findUnique({
        where: { email: registration.email }
      });

      if (!candidate) {
        candidate = await this.prisma.candidate.create({
          data: {
            name: registration.name,
            email: registration.email,
            phone: registration.mobile,
            resumeUrl: registration.resumeUrl,
            currentState: registration.currentState,
            currentCity: registration.currentCity,
            hometownState: registration.hometownState,
            hometownCity: registration.hometownCity,
            aptitudePaperSet: registration.aptitudePaperSet,
            aptitudeMarks: registration.aptitudeMarks,
            techMarks: registration.techMarks,
            totalMarks: registration.totalMarks,
          }
        });
      } else {
        // Update existing candidate marks and location if they are shortlisted again or via walk-in
        candidate = await this.prisma.candidate.update({
          where: { id: candidate.id },
          data: {
            currentState: registration.currentState,
            currentCity: registration.currentCity,
            hometownState: registration.hometownState,
            hometownCity: registration.hometownCity,
            aptitudePaperSet: registration.aptitudePaperSet,
            aptitudeMarks: registration.aptitudeMarks,
            techMarks: registration.techMarks,
            totalMarks: registration.totalMarks,
          }
        });
      }

      // Link back to walk-in record
      return this.prisma.walkInRegistration.update({
        where: { id },
        data: { candidateId: candidate.id }
      });
    }

    return registration;
  }

  async addRound(registrationId: number, data: any) {
    return this.prisma.walkInRound.create({
      data: {
        ...data,
        registrationId,
      },
    });
  }

  async getRounds(registrationId: number) {
    return this.prisma.walkInRound.findMany({
      where: { registrationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updatePaper(registrationId: number, data: any) {
    return this.prisma.paperTracking.upsert({
      where: { registrationId },
      update: data,
      create: {
        ...data,
        registrationId,
      },
    });
  }

  async getPaper(registrationId: number) {
    return this.prisma.paperTracking.findUnique({
      where: { registrationId },
    });
  }

  async getEvaluationData(registrationId: number) {
    const data = await this.prisma.walkInRegistration.findUnique({
      where: { id: registrationId },
      include: {
        campaign: true,
        rounds: true,
        paperTracking: true,
      },
    });
    if (!data) throw new NotFoundException('Registration not found');
    return data;
  }

  async bulkUpdate(ids: number[], action: string, data?: any) {
    if (action === 'REJECT') {
      const regs = await this.prisma.walkInRegistration.findMany({
        where: { id: { in: ids } },
        include: { campaign: true }
      });

      await this.prisma.walkInRegistration.updateMany({
        where: { id: { in: ids } },
        data: { status: 'REJECTED' }
      });

      // Send rejection emails
      for (const reg of regs) {
        await this.emailService.sendEmail(
          reg.email,
          `Application Update - ${reg.campaign.title}`,
          `Hi ${reg.name},\n\nThank you for participating in our walk-in drive for "${reg.campaign.title}".\n\nAfter careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nRegards,\nRecruitment Team`
        );
      }
      return { success: true };
    }

    if (action === 'SHORTLIST') {
      const results: any[] = [];
      for (const id of ids) {
        const res = await this.updateAptitude(id, { 
          aptitudeMarks: 0, 
          techMarks: 0, 
          isShortlistedAptitude: true 
        });
        results.push(res);
      }
      return results;
    }

    if (action === 'ASSIGN_ROUND') {
      return Promise.all(ids.map(id => this.addRound(id, data)));
    }

    if (action === 'DELETE') {
      return this.prisma.$transaction(async (tx) => {
        // 1. Delete associated rounds
        await tx.walkInRound.deleteMany({
          where: { registrationId: { in: ids } }
        });

        // 2. Delete associated paper tracking
        await tx.paperTracking.deleteMany({
          where: { registrationId: { in: ids } }
        });

        // 3. Delete slot bookings associated with these registrations
        await tx.slotBooking.deleteMany({
          where: { walkinRegistrationId: { in: ids } }
        });

        // 4. Delete the registrations
        return tx.walkInRegistration.deleteMany({
          where: { id: { in: ids } }
        });
      });
    }
  }

  async bulkSendBookingEmail(registrationIds: number[], driveId: number) {
    const registrations = await this.prisma.walkInRegistration.findMany({
      where: { id: { in: registrationIds } },
      include: { campaign: true }
    });

    const drive = await this.prisma.drive.findUnique({
      where: { id: driveId },
      include: { job: true }
    });

    if (!drive) throw new NotFoundException('Hiring Drive not found');

    const results: any[] = [];
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    for (const reg of registrations) {
      try {
        const bookingLink = `${frontendUrl}/book-slot/${driveId}?email=${encodeURIComponent(reg.email)}&walkinId=${reg.id}`;
        
        await this.emailService.sendEmail(
          reg.email,
          `Action Required: Book your Interview Slot - ${reg.campaign.title}`,
          `Hi ${reg.name},\n\nCongratulations! You have been shortlisted for the next round of our walk-in drive for "${reg.campaign.title}".\n\nPlease use the link below to select and book your preferred interview time slot:\n\n${bookingLink}\n\nNote: Please book your slot as soon as possible as they are available on a first-come, first-served basis.\n\nRegards,\nRecruitment Team`
        );

        results.push({ id: reg.id, status: 'SENT' });
      } catch (err) {
        results.push({ id: reg.id, status: 'FAILED', error: err.message });
      }
    }

    return results;
  }
}

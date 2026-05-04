import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';

@Injectable()
export class SlotsService {
  private verifyAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private confirmAttempts = new Map<string, { count: number; lastAttempt: number }>();
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createDriveWithSlots(driveData: any, slots: any[]) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Drive
      const drive = await tx.drive.create({
        data: {
          name: driveData.name,
          jobId: parseInt(driveData.jobId),
          location: driveData.location,
          description: driveData.description,
          startDate: new Date(driveData.startDate),
          endDate: new Date(driveData.endDate),
          slotType: driveData.slotType,
          slotDuration: parseInt(driveData.slotDuration),
          bufferTime: parseInt(driveData.bufferTime),
          capacity: parseInt(driveData.capacity),
        },
      });

      // 2. Prepare slots for bulk insert
      const slotsToInsert = slots.map((slot) => ({
        driveId: drive.id,
        date: new Date(slot.date),
        startTime: this.combineDateAndTime(slot.date, slot.startTime),
        endTime: this.combineDateAndTime(slot.date, slot.endTime),
        capacity: parseInt(slot.capacity),
        booked: 0,
        status: 'OPEN',
      }));

      // 3. Bulk insert slots
      await tx.slot.createMany({
        data: slotsToInsert,
      });

      return drive;
    });
  }

  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    // Force +05:30 (IST) to ensure consistency regardless of server location
    return new Date(`${dateStr}T${timeStr}:00+05:30`);
  }

  async findAllDrives() {
    return this.prisma.drive.findMany({
      include: {
        job: true,
        _count: {
          select: { slots: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBookingsByDrive(driveId: number) {
    return this.prisma.slotBooking.findMany({
      where: {
        slot: {
          driveId: driveId,
        },
      },
      include: {
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneDrive(id: number) {
    const drive = await this.prisma.drive.findUnique({
      where: { id },
      include: {
        job: true,
        slots: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!drive) {
      throw new NotFoundException(`Drive with ID ${id} not found`);
    }

    return drive;
  }

  async findOneBooking(id: number) {
    const booking = await this.prisma.slotBooking.findUnique({
      where: { id },
      include: {
        slot: {
          include: {
            drive: {
              include: { job: true },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async bookSlot(bookingData: { driveId: number; slotId: number; name: string; email: string; mobile: string }) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Get and verify Drive & Slot
      const drive = await tx.drive.findUnique({
        where: { id: bookingData.driveId },
        include: { job: true },
      });

      const slot = await tx.slot.findUnique({
        where: { id: bookingData.slotId },
      });

      if (!drive || !slot) {
        throw new NotFoundException('Drive or Slot not found');
      }

      // Harden: Enforce one booking per drive
      const existingBooking = await tx.slotBooking.findFirst({
        where: {
          slot: { driveId: drive.id },
          OR: [
            { email: bookingData.email },
            { mobile: bookingData.mobile },
          ],
          status: { not: 'CANCELLED' }
        }
      });

      if (existingBooking) {
        throw new BadRequestException('You already have an active booking for this recruitment drive.');
      }

      if (slot.status !== 'OPEN' || slot.booked >= slot.capacity) {
        throw new BadRequestException('Slot is no longer available');
      }

      // 2. Candidate Lookup / Creation
      let candidate = await tx.candidate.findFirst({
        where: {
          OR: [
            { email: bookingData.email },
            { phone: bookingData.mobile },
          ],
        },
      });

      if (!candidate) {
        candidate = await tx.candidate.create({
          data: {
            name: bookingData.name,
            email: bookingData.email,
            phone: bookingData.mobile,
            source: 'Slot Booking',
          },
        });
      }

      // 3. Check for existing Application
      let application = await tx.application.findFirst({
        where: {
          candidateId: candidate.id,
          jobId: drive.jobId,
        },
      });

      if (!application) {
        application = await tx.application.create({
          data: {
            candidateId: candidate.id,
            jobId: drive.jobId,
            status: 'INTERVIEW',
          },
        });
      } else {
        await tx.application.update({
          where: { id: application.id },
          data: { status: 'INTERVIEW' },
        });
      }

      // 4. Create Interview
      const interview = await tx.interview.create({
        data: {
          applicationId: application.id,
          round: 'LEVEL_1',
          date: slot.startTime,
          endTime: slot.endTime,
          location: drive.location,
          status: 'SCHEDULED',
        },
        include: {
          application: {
            include: {
              candidate: true,
              job: true,
            },
          },
        },
      });

      // 5. Create the Booking Record
      const booking = await tx.slotBooking.create({
        data: {
          driveId: drive.id,
          slotId: bookingData.slotId,
          name: bookingData.name,
          email: bookingData.email,
          mobile: bookingData.mobile,
          candidateId: candidate.id,
          interviewId: interview.id,
        },
      });

      // 6. Update slot booked count
      const updatedBooked = slot.booked + 1;
      const newStatus = updatedBooked >= slot.capacity ? 'FULL' : 'OPEN';

      await tx.slot.update({
        where: { id: slot.id },
        data: {
          booked: updatedBooked,
          status: newStatus,
        },
      });

      return { booking, interview, candidate, drive };
    });

    // 7. Trigger Email
    if (result.candidate.email) {
      try {
        const formattedDateTime = new Date(result.interview.date).toLocaleString('en-IN', {
          dateStyle: 'full',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata'
        });

        const managementLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/manage/${result.booking.token}`;

        await this.emailService.sendTemplateEmail({
          slug: 'interview-scheduled',
          to: result.candidate.email,
          candidateId: result.candidate.id,
          emailType: 'interview',
          variables: {
            candidate_name: result.candidate.name,
            job_title: result.drive.job.title,
            interview_level: 'Initial Round',
            interview_date_time: formattedDateTime,
            location: result.interview.location || 'Office / Link to be shared',
            interviewer_name: 'TBD',
            management_link: managementLink,
          },
        });
      } catch (error) {
        console.error('[SlotsService] Email Trigger Failed:', error.message);
      }
    }

    return result.booking;
  }

  async findOneBookingByToken(token: string) {
    const booking = await this.prisma.slotBooking.findUnique({
      where: { token },
      include: {
        slot: {
          include: {
            drive: {
              include: { 
                job: true,
                slots: {
                  where: { status: 'OPEN' },
                  orderBy: { startTime: 'asc' }
                }
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Harden: Block access if slot time passed
    const now = new Date();
    if (booking.slot.startTime < now && booking.status !== 'CANCELLED') {
      throw new BadRequestException('Access denied: This slot time has already passed.');
    }

    return booking;
  }

  async rescheduleBooking(idOrToken: string | number, newSlotId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const where: any = typeof idOrToken === 'number' ? { id: idOrToken } : { token: idOrToken };
      const booking = await tx.slotBooking.findUnique({
        where,
        include: { slot: true },
      });

      if (!booking || booking.status !== 'CONFIRMED') {
        throw new BadRequestException('Action only allowed for confirmed bookings');
      }

      // Rule: 1 hour before
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      if (booking.slot.startTime < oneHourFromNow) {
        throw new BadRequestException('Rescheduling not allowed within 1 hour of slot start time');
      }

      const newSlot = await tx.slot.findUnique({
        where: { id: newSlotId },
      });

      if (!newSlot || newSlot.status !== 'OPEN' || newSlot.booked >= newSlot.capacity) {
        throw new BadRequestException('New slot is not available');
      }

      // 1. Update Old Slot
      await tx.slot.update({
        where: { id: booking.slotId },
        data: {
          booked: { decrement: 1 },
          status: 'OPEN',
        },
      });

      // 2. Update New Slot
      const updatedBooked = newSlot.booked + 1;
      await tx.slot.update({
        where: { id: newSlotId },
        data: {
          booked: updatedBooked,
          status: updatedBooked >= newSlot.capacity ? 'FULL' : 'OPEN',
        },
      });

      // 3. Update Booking
      const updatedBooking = await tx.slotBooking.update({
        where: { id: booking.id },
        data: { slotId: newSlotId },
      });

      // 4. Update Interview
      let updatedInterview: any = null;
      if (booking.interviewId) {
        updatedInterview = await tx.interview.update({
          where: { id: booking.interviewId },
          data: {
            date: newSlot.startTime,
            endTime: newSlot.endTime,
          },
          include: {
            application: {
              include: { candidate: true, job: true },
            },
          },
        });
      }

      return { booking: updatedBooking, interview: updatedInterview, oldSlot: booking.slot, newSlot };
    });

    // Email
    if (result.interview) {
      try {
        const formattedDateTime = new Date(result.newSlot.startTime).toLocaleString('en-IN', {
          dateStyle: 'full',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata'
        });

        const managementLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/manage/${result.booking.token}`;

        await this.emailService.sendTemplateEmail({
          slug: 'interview-rescheduled',
          to: result.interview.application.candidate.email,
          candidateId: result.interview.application.candidate.id,
          emailType: 'interview',
          variables: {
            candidate_name: result.interview.application.candidate.name,
            job_title: result.interview.application.job.title,
            interview_level: 'Initial Round',
            interview_date_time: formattedDateTime,
            location: result.interview.location || 'Office',
            management_link: managementLink,
          },
        });
      } catch (error) {
        console.error('[SlotsService] Reschedule Email Failed:', error.message);
      }
    }

    return result.booking;
  }

  async cancelBooking(idOrToken: string | number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const where: any = typeof idOrToken === 'number' ? { id: idOrToken } : { token: idOrToken };
      const booking = await tx.slotBooking.findUnique({
        where,
        include: { slot: true },
      });

      if (!booking || booking.status !== 'CONFIRMED') {
        throw new BadRequestException('Action only allowed for confirmed bookings');
      }

      // Harden: Block cancel after slot time
      const now = new Date();
      if (booking.slot.startTime < now) {
        throw new BadRequestException('Cannot cancel a booking that has already started or passed');
      }

      // Rule: 1 hour before
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      if (booking.slot.startTime < oneHourFromNow) {
        throw new BadRequestException('Cancellation not allowed within 1 hour of slot start time');
      }

      // 1. Update Slot
      await tx.slot.update({
        where: { id: booking.slotId },
        data: {
          booked: { decrement: 1 },
          status: 'OPEN',
        },
      });

      // 2. Update Booking
      const updatedBooking = await tx.slotBooking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      });

      // 3. Update Interview
      let cancelledInterview: any = null;
      if (booking.interviewId) {
        cancelledInterview = await tx.interview.update({
          where: { id: booking.interviewId },
          data: { status: 'CANCELLED' },
          include: {
            application: {
              include: { candidate: true, job: true },
            },
          },
        });
      }

      return { booking: updatedBooking, interview: cancelledInterview, slot: booking.slot };
    });

    // Email
    if (result.interview) {
      try {
        const formattedDateTime = new Date(result.slot.startTime).toLocaleString('en-IN', {
          dateStyle: 'full',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata'
        });

        await this.emailService.sendTemplateEmail({
          slug: 'interview-cancelled',
          to: result.interview.application.candidate.email,
          candidateId: result.interview.application.candidate.id,
          emailType: 'interview',
          variables: {
            candidate_name: result.interview.application.candidate.name,
            job_title: result.interview.application.job.title,
            interview_date_time: formattedDateTime,
          },
        });
      } catch (error) {
        console.error('[SlotsService] Cancel Email Failed:', error.message);
      }
    }

    return result.booking;
  }

  async verifyCheckIn(driveId: number, identifier: string, ip: string) {
    // Harden: Rate limiting
    const rateKey = `${ip}:${identifier}`;
    const now = new Date();
    const attempt = this.verifyAttempts.get(rateKey);
    if (attempt && now.getTime() - attempt.lastAttempt < 60000 && attempt.count >= 5) {
      throw new BadRequestException('Too many attempts. Please try again after a minute.');
    }
    this.verifyAttempts.set(rateKey, { 
      count: (attempt?.count || 0) + 1, 
      lastAttempt: now.getTime() 
    });

    const booking = await this.prisma.slotBooking.findFirst({
      where: {
        slot: { driveId },
        status: 'CONFIRMED',
        OR: [
          { email: identifier },
          { mobile: identifier },
        ],
      },
      include: {
        slot: {
          include: { drive: { include: { job: true } } },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('No active booking found for this email/mobile.');
    }

    // Validation: current time within allowed range (e.g., 2 hours before slot)
    const startTime = new Date(booking.slot.startTime);
    const twoHoursBefore = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
    
    // We allow check-in up to the end of the slot duration + buffer
    const endTime = new Date(booking.slot.endTime);

    if (now < twoHoursBefore) {
      throw new BadRequestException('Too early for check-in. Please arrive closer to your slot time.');
    }

    if (now > endTime) {
       throw new BadRequestException('This slot has already ended.');
    }

    // Harden: Issue verify token (5 mins)
    const checkInToken = crypto.randomBytes(32).toString('hex');
    const checkInTokenExpires = new Date(now.getTime() + 5 * 60 * 1000);

    await this.prisma.slotBooking.update({
      where: { id: booking.id },
      data: { checkInToken, checkInTokenExpires }
    });

    return { ...booking, checkInToken };
  }

  async confirmCheckIn(bookingId: number, token: string, ip: string, userLocation?: { lat: number; lng: number }) {
    // 1. Rate Limiting
    const rateKey = `${ip}:${bookingId}`;
    const now = new Date();
    const attempt = this.confirmAttempts.get(rateKey);
    if (attempt && now.getTime() - attempt.lastAttempt < 60000 && attempt.count >= 5) {
      throw new BadRequestException('Too many attempts. Please try again after a minute.');
    }
    this.confirmAttempts.set(rateKey, { 
      count: (attempt?.count || 0) + 1, 
      lastAttempt: now.getTime() 
    });

    const booking = await this.prisma.slotBooking.findUnique({
      where: { id: bookingId },
      include: { slot: { include: { drive: true } } }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    // 2. Idempotency: If already checked in, return success
    if (booking.status === 'CHECKED_IN') {
      return booking;
    }

    if (booking.checkInToken !== token) {
      throw new BadRequestException('Invalid or expired check-in session.');
    }

    if (!booking.checkInTokenExpires || booking.checkInTokenExpires < now) {
      throw new BadRequestException('Check-in session has expired. Please verify again.');
    }

    // 3. Re-enforce Time-window
    const startTime = new Date(booking.slot.startTime);
    const twoHoursBefore = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
    const endTime = new Date(booking.slot.endTime);

    if (now < twoHoursBefore) {
      throw new BadRequestException('Too early for check-in.');
    }

    if (now > endTime) {
       throw new BadRequestException('This slot has already ended.');
    }

    // 4. Re-enforce Geolocation (150m)
    if (booking.slot.drive.venueLat && booking.slot.drive.venueLng) {
      if (!userLocation) {
        throw new BadRequestException('Location access is required for check-in.');
      }

      const distance = this.calculateDistance(
        userLocation.lat, userLocation.lng,
        booking.slot.drive.venueLat, booking.slot.drive.venueLng
      );

      if (distance > 150) {
        throw new BadRequestException(`Check-in only allowed at the venue. You are ${Math.round(distance)}m away.`);
      }
    }

    // 5. Generate Sequential ID (T001)
    const checkInCount = await this.prisma.slotBooking.count({
      where: {
        driveId: booking.driveId,
        checkInTime: { not: null }
      }
    });
    const sequenceId = `T${(checkInCount + 1).toString().padStart(3, '0')}`;

    const updatedBooking = await this.prisma.slotBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CHECKED_IN',
        attendanceStatus: 'PRESENT',
        checkInTime: new Date(),
        walkinIdSequence: sequenceId,
        checkInToken: null,
        checkInTokenExpires: null,
      },
      include: {
        slot: {
          include: { drive: { include: { job: true } } },
        },
      },
    });

    // 6. Trigger Check-in Email
    try {
      const slotTime = new Date(updatedBooking.slot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
      
      await this.emailService.sendEmail(
        updatedBooking.email,
        `Check-in Confirmed: Registration ID ${sequenceId}`,
        `Hi ${updatedBooking.name},\n\nYou have successfully checked in for the walk-in drive: "${updatedBooking.slot.drive.name}".\n\nYour Registration ID: ${sequenceId}\nInterview Slot: ${slotTime}\n\nPlease keep this ID handy and wait for your turn. Our team will call you shortly.\n\nRegards,\nRecruitment Team`
      );
    } catch (err) {
      console.error('Failed to send check-in confirmation email', err);
    }

    return updatedBooking;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  async getLiveStats(driveId: number) {
    const drive = await this.prisma.drive.findUnique({
      where: { id: driveId },
      include: { job: true },
    });

    if (!drive) throw new NotFoundException('Drive not found');

    const bookings = await this.prisma.slotBooking.findMany({
      where: { slot: { driveId } },
      include: { slot: true },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total: bookings.length,
      checkedIn: bookings.filter((b) => b.status === 'CHECKED_IN').length,
      pending: bookings.filter((b) => b.status === 'CONFIRMED').length,
      noShow: bookings.filter((b) => b.status === 'NO_SHOW').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
    };

    return { drive, bookings, stats };
  }

  async sendBookingEmail(candidateId: number, driveId: number, userId?: number) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
    const drive = await this.prisma.drive.findUnique({ 
      where: { id: driveId },
      include: { job: true }
    });

    if (!candidate || !drive) {
      throw new NotFoundException('Candidate or Drive not found');
    }

    const bookingLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/book-slot/${driveId}`;

    await this.emailService.sendRawEmail({
      to: candidate.email,
      subject: `Action Required: Book your interview slot for ${drive.job.title}`,
      body: `
        <p>Hi ${candidate.firstName || candidate.name},</p>
        <p>We are pleased to invite you to the next round of our recruitment process for the <strong>${drive.job.title}</strong> position.</p>
        <p>Please click the link below to select a convenient interview slot during our upcoming hiring drive:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${bookingLink}" style="background-color: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Book My Interview Slot</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p><a href="${bookingLink}">${bookingLink}</a></p>
        <p>We look forward to meeting you!</p>
      `,
      candidateId: candidate.id,
      userId,
      emailType: 'slot_invite'
    });

    return { success: true };
  }

  async getAnalytics(driveId: number) {
    const drive = await this.prisma.drive.findUnique({
      where: { id: driveId },
      include: {
        job: true,
        slots: {
          include: {
            _count: {
              select: { bookings: true },
            },
            bookings: true,
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!drive) throw new NotFoundException('Drive not found');

    const allBookings = await this.prisma.slotBooking.findMany({
      where: { slot: { driveId } },
      include: {
        slot: true,
        // include candidate source if needed, but we can aggregate from what we have
      },
    });

    // Aggregates
    const totalSlots = drive.slots.length;
    const totalCapacity = drive.slots.reduce((acc, s) => acc + s.capacity, 0);
    const totalBooked = allBookings.length;
    const totalCheckedIn = allBookings.filter(b => b.status === 'CHECKED_IN').length;
    const totalNoShow = allBookings.filter(b => b.status === 'NO_SHOW').length;

    // Slot-wise breakdown
    const slotBreakdown = drive.slots.map(slot => ({
      id: slot.id,
      time: `${slot.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}`,
      capacity: slot.capacity,
      booked: slot.bookings.length,
      checkedIn: slot.bookings.filter(b => b.status === 'CHECKED_IN').length,
      noShow: slot.bookings.filter(b => b.status === 'NO_SHOW').length,
    }));

    // Source performance (using dummy sources for now or actual if available)
    // In real app, we would join with Candidate table
    const sources = await this.prisma.slotBooking.groupBy({
      by: ['email'], // This is not ideal, but let's try to get candidate info
      where: { slot: { driveId } },
    });

    // Better way: get all candidate IDs and then fetch their sources
    const candidateIds = allBookings.map(b => b.candidateId).filter(id => id !== null) as number[];
    const candidates = await this.prisma.candidate.findMany({
      where: { id: { in: candidateIds } },
      select: { source: true },
    });

    const sourceStats = candidates.reduce((acc: any, curr) => {
      const src = curr.source || 'Unknown';
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {});

    return {
      drive,
      summary: {
        totalSlots,
        totalCapacity,
        totalBooked,
        totalCheckedIn,
        totalNoShow,
        showRate: totalBooked > 0 ? (totalCheckedIn / totalBooked) * 100 : 0,
        noShowRate: totalBooked > 0 ? (totalNoShow / totalBooked) * 100 : 0,
      },
      slotBreakdown,
      sourceStats,
    };
  }

  @Cron('*/15 * * * *')
  async processNoShows() {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

    return this.prisma.slotBooking.updateMany({
      where: {
        status: 'CONFIRMED',
        slot: {
          endTime: { lt: thirtyMinsAgo }
        }
      },
      data: {
        status: 'NO_SHOW'
      }
    });
  }

  async findBookingsBySlot(slotId: number) {
    return this.prisma.slotBooking.findMany({
      where: { slotId },
      include: {
        walkinRegistration: true,
        candidate: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSlotCapacity(slotId: number, capacity: number) {
    const slot = await this.prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) throw new NotFoundException('Slot not found');

    const status = slot.booked >= capacity ? 'FULL' : 'OPEN';

    return this.prisma.slot.update({
      where: { id: slotId },
      data: { capacity, status },
    });
  }

  async removeDrive(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete all bookings associated with slots in this drive
      await tx.slotBooking.deleteMany({
        where: {
          slot: { driveId: id }
        }
      });

      // 2. Delete all slots in this drive
      await tx.slot.deleteMany({
        where: { driveId: id }
      });

      // 3. Delete the drive itself
      return tx.drive.delete({
        where: { id }
      });
    });
  }
}

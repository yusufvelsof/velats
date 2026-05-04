import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subMonths, subYears, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalCandidates = await this.prisma.candidate.count({ where: { deletedAt: null } });
    const totalJobs = await this.prisma.job.count({ where: { deletedAt: null } });
    
    const applicationGroups = await this.prisma.application.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const initialStats = {
      APPLIED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      OFFER: 0,
      HIRED: 0,
    };

    const applicationStats = applicationGroups.reduce((acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    }, initialStats);

    return {
      totalCandidates,
      totalJobs,
      applicationStats,
    };
  }

  async getWalkinStats(range: string, startDate?: string, endDate?: string) {
    let fromDate: Date | undefined;
    let toDate: Date = endOfDay(new Date());

    if (range === '1m') fromDate = startOfDay(subMonths(new Date(), 1));
    else if (range === '3m') fromDate = startOfDay(subMonths(new Date(), 3));
    else if (range === '6m') fromDate = startOfDay(subMonths(new Date(), 6));
    else if (range === '1y') fromDate = startOfDay(subYears(new Date(), 1));
    else if (range === 'custom' && startDate && endDate) {
      fromDate = startOfDay(new Date(startDate));
      toDate = endOfDay(new Date(endDate));
    }

    const where: any = fromDate ? { createdAt: { gte: fromDate, lte: toDate } } : {};

    const totalWalkins = await this.prisma.walkInRegistration.count({ where });
    const aptitudeShortlisted = await this.prisma.walkInRegistration.count({ 
      where: { ...where, isShortlistedAptitude: true } 
    });

    // Track candidates who originated from Walk-ins
    const walkinCandidateIds = await this.prisma.walkInRegistration.findMany({
      where: { ...where, candidateId: { not: null } },
      select: { candidateId: true }
    }).then(res => res.map(r => r.candidateId as number));

    // 1. Technical Interview Scheduled in main ATS
    const technicalScheduled = await this.prisma.application.count({
      where: {
        candidateId: { in: walkinCandidateIds },
        interviews: { some: { round: { contains: 'TECH', mode: 'insensitive' } } }
      }
    });

    // 2. HR Interview Scheduled in main ATS
    const hrScheduled = await this.prisma.application.count({
      where: {
        candidateId: { in: walkinCandidateIds },
        interviews: { some: { round: { contains: 'HR', mode: 'insensitive' } } }
      }
    });

    // 3. Final Offer / Hired Status
    const hiredCount = await this.prisma.candidate.count({
      where: {
        id: { in: walkinCandidateIds },
        isHired: true
      }
    });

    // 4. Trial / Onboarding Status
    const onTrialCount = await this.prisma.candidate.count({
      where: {
        id: { in: walkinCandidateIds },
        isOnTrial: true
      }
    });

    // 5. Total Rejections (from Walkin + Main ATS)
    const walkinRejected = await this.prisma.walkInRegistration.count({
      where: { ...where, status: 'REJECTED' }
    });
    const atsRejected = await this.prisma.application.count({
      where: {
        candidateId: { in: walkinCandidateIds },
        status: 'REJECTED'
      }
    });

    return {
      totalWalkins,
      aptitudeShortlisted,
      technicalScheduled,
      hrScheduled,
      hiredCount,
      onTrialCount,
      totalRejections: walkinRejected + atsRejected
    };
  }
}

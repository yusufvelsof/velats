import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.length < 2) return { candidates: [], jobs: [], campaigns: [] };

    const [candidates, jobs, campaigns] = await Promise.all([
      this.prisma.candidate.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ],
          deletedAt: null,
        },
        take: 5,
        select: { id: true, name: true, email: true, status: true },
      }),
      this.prisma.job.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { department: { contains: query, mode: 'insensitive' } },
          ],
          deletedAt: null,
        },
        take: 5,
        select: { id: true, title: true, department: true, status: true },
      }),
      this.prisma.walkInCampaign.findMany({
        where: {
          title: { contains: query, mode: 'insensitive' },
        },
        take: 5,
        select: { id: true, title: true, profile: true },
      }),
    ]);

    return { candidates, jobs, campaigns };
  }
}

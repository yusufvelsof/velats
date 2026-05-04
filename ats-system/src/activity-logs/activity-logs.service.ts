import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    action: string;
    entityType: string;
    entityId: number;
    description: string;
    userId?: number;
  }) {
    return this.prisma.activityLog.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

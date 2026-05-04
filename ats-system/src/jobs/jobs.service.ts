import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    return this.prisma.job.create({
      data: createJobDto,
    });
  }

  async findAll(): Promise<Job[]> {
    return this.prisma.job.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { 
            applications: {
              where: {
                candidate: { deletedAt: null }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublicJobs(): Promise<Job[]> {
    return this.prisma.job.findMany({
      where: { 
        status: 'OPEN',
        deletedAt: null
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Job> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            applications: {
              where: {
                candidate: { deletedAt: null }
              }
            }
          }
        }
      }
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async update(id: number, updateJobDto: UpdateJobDto): Promise<Job> {
    try {
      const { id: _, createdAt: __, _count: ___, ...data } = updateJobDto as any;
      return await this.prisma.job.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Update error:', error);
      throw new NotFoundException(`Job with ID ${id} not found or update failed`);
    }
  }

  async remove(id: number): Promise<Job> {
    try {
      return await this.prisma.job.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (error) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
  }
}

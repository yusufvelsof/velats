import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.emailTemplate.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { version: 'desc' },
        },
      },
    });
    if (!template) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }
    return template;
  }

  async findBySlug(slug: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { slug },
    });
    if (!template) {
      throw new NotFoundException(`Email template with slug "${slug}" not found`);
    }
    return template;
  }

  async create(createEmailTemplateDto: CreateEmailTemplateDto) {
    return this.prisma.emailTemplate.create({
      data: {
        ...createEmailTemplateDto,
        version: 1,
      },
    });
  }

  async update(id: number, updateEmailTemplateDto: UpdateEmailTemplateDto) {
    const { reason, ...data } = updateEmailTemplateDto;
    
    const current = await this.prisma.emailTemplate.findUnique({
      where: { id },
    });
    
    if (!current) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }

    // Save history before update
    await this.prisma.emailTemplateHistory.create({
      data: {
        templateId: current.id,
        version: current.version,
        name: current.name,
        subject: current.subject,
        body: current.body,
        defaultFromEmail: current.defaultFromEmail,
        addSignature: current.addSignature,
        attachments: current.attachments || undefined,
        reason: reason || 'Manual Update',
      },
    });

    return this.prisma.emailTemplate.update({
      where: { id },
      data: {
        ...data,
        version: current.version + 1,
      },
    });
  }

  async remove(id: number) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }

    return this.prisma.emailTemplate.delete({
      where: { id },
    });
  }
}

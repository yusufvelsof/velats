import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('send-composer')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async sendComposer(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploadedAttachments = files?.map((f) => ({
      name: f.originalname,
      url: `./uploads/${f.filename}`,
    })) || [];

    let templateAttachments = [];
    if (body.templateAttachments) {
      try {
        templateAttachments = JSON.parse(body.templateAttachments);
      } catch (e) {
        console.error('Failed to parse templateAttachments', e);
      }
    }

    const allAttachments = [...templateAttachments, ...uploadedAttachments];

    // Parse numeric fields as they come as strings in FormData
    const payload = {
      ...body,
      candidateId: parseInt(body.candidateId),
      userId: body.userId ? parseInt(body.userId) : undefined,
      attachments: allAttachments.length > 0 ? allAttachments : undefined,
    };

    return this.emailService.sendRawEmail(payload);
  }

  @Get('history/:candidateId')
  async getHistory(@Param('candidateId', ParseIntPipe) candidateId: number) {
    return this.prisma.emailLog.findMany({
      where: { candidateId },
      orderBy: { sentAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }
}

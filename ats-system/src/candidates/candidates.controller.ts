import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import * as express from 'express';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get('attachments/:id/download')
  @Public() // Allow public download if needed, or remove if auth required
  async downloadAttachment(@Param('id', ParseIntPipe) id: number, @Res() res: express.Response) {
    return this.candidatesService.downloadAttachment(id, res);
  }

  @Get('attachments/:id/preview')
  @Public()
  async previewAttachment(@Param('id', ParseIntPipe) id: number) {
    return this.candidatesService.previewAttachment(id);
  }

  @Public()
  @Post()
  create(@Body() createCandidateDto: CreateCandidateDto, @Request() req) {
    const userId = req.user?.userId;
    return this.candidatesService.create(createCandidateDto, userId);
  }

  @Get()
  findAll(@Query('search') search?: string, @Query() filters?: any) {
    return this.candidatesService.findAll(search, filters);
  }

  @Patch('application/:appId/status')
  updateApplicationStatus(
    @Param('appId', ParseIntPipe) appId: number,
    @Body() data: { status: string, offeredSalary?: string, offerStatus?: string, joiningDate?: Date },
  ) {
    return this.candidatesService.updateApplicationStatus(appId, data);
  }

  @Post('merge')
  merge(@Body() data: { targetId: number, sourceId: number }) {
    return this.candidatesService.mergeCandidates(data.targetId, data.sourceId);
  }

  @Get('check-duplicate')
  checkDuplicate(@Query('email') email: string, @Query('phone') phone?: string) {
    return this.candidatesService.checkDuplicate(email, phone);
  }

  @Get('prefill')
  getPrefillData(@Query('source') source: string, @Query('id') id: string) {
    return this.candidatesService.getPrefillData(source, id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.candidatesService.findOne(id);
  }

  @Public()
  @Post('parse')
  @UseInterceptors(
    FileInterceptor('file', {
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
  async parseResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.candidatesService.parseResume(file);
  }

  @Public()
  @Post(':id/upload-resume')
  @UseInterceptors(
    FileInterceptor('file', {
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
  uploadResume(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const userId = req.user?.userId;
    return this.candidatesService.update(id, {
      resumeUrl: `/uploads/${file.filename}`,
      lastName: '', // Hack to bypass DTO validation if partial
    }, userId);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
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
  uploadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: string,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const userId = req.user?.userId;
    return this.candidatesService.addAttachment(id, file, category, userId);
  }

  @Delete('attachments/:id')
  @Roles('ADMIN')
  removeAttachment(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.userId;
    return this.candidatesService.removeAttachment(id, userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status: string },
    @Request() req,
  ) {
    const userId = req.user?.userId;
    return this.candidatesService.updateStatus(id, data, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    return this.candidatesService.update(id, updateCandidateDto, userId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.candidatesService.remove(id);
  }
}

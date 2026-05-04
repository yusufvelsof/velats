import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Delete,
  Body, 
  Param, 
  Query,
  ParseIntPipe, 
  UseInterceptors, 
  UploadedFiles,
  Request,
  ForbiddenException
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { WalkinsService } from './walkins.service';
import { CreateWalkInCampaignDto } from './dto/create-campaign.dto';
import { RegisterWalkInDto } from './dto/register-walkin.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('walkins')
export class WalkinsController {
  constructor(private readonly walkinsService: WalkinsService) {}

  @Post('campaign')
  @Roles('ADMIN')
  createCampaign(@Body() dto: CreateWalkInCampaignDto) {
    return this.walkinsService.createCampaign(dto);
  }

  @Get('campaigns')
  getCampaigns() {
    return this.walkinsService.getCampaigns();
  }

  @Public()
  @Get('campaign/:id')
  getCampaignById(@Param('id', ParseIntPipe) id: number) {
    return this.walkinsService.getCampaignById(id);
  }

  @Patch('campaign/:id')
  @Roles('ADMIN')
  updateCampaign(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateWalkInCampaignDto>
  ) {
    return this.walkinsService.updateCampaign(id, data);
  }

  @Delete('campaign/:id')
  @Roles('ADMIN')
  deleteCampaign(@Param('id', ParseIntPipe) id: number) {
    return this.walkinsService.deleteCampaign(id);
  }

  @Delete('registration/:id')
  @Roles('ADMIN')
  deleteRegistration(@Param('id', ParseIntPipe) id: number) {
    return this.walkinsService.deleteRegistration(id);
  }

  @Public()
  @Post('register/:campaignId')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'resume', maxCount: 1 },
      { name: 'photo', maxCount: 1 },
      { name: 'certificate', maxCount: 1 },
    ], {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  register(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Body() dto: RegisterWalkInDto,
    @UploadedFiles() files: { resume?: Express.Multer.File[], photo?: Express.Multer.File[], certificate?: Express.Multer.File[] }
  ) {
    const filePaths = {
      resume: files.resume?.[0]?.path.replace(/\\/g, '/'),
      photo: files.photo?.[0]?.path.replace(/\\/g, '/'),
      certificate: files.certificate?.[0]?.path.replace(/\\/g, '/'),
    };
    return this.walkinsService.register(campaignId, dto, filePaths);
  }

  @Get('registrations/:campaignId')
  getRegistrations(@Param('campaignId', ParseIntPipe) campaignId: number, @Query() query: any) {
    return this.walkinsService.getRegistrations(campaignId, query);
  }

  @Patch('aptitude/:id')
  updateAptitude(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { aptitudeMarks: number; techMarks: number; isShortlistedAptitude: boolean; aptitudePaperSet?: string }
  ) {
    return this.walkinsService.updateAptitude(id, data);
  }

  @Post('round')
  addRound(@Body() data: any) {
    const { registrationId, ...roundData } = data;
    return this.walkinsService.addRound(registrationId, roundData);
  }

  @Get('rounds/:registrationId')
  getRounds(@Param('registrationId', ParseIntPipe) registrationId: number) {
    return this.walkinsService.getRounds(registrationId);
  }

  @Post('paper')
  updatePaper(@Body() data: any) {
    const { registrationId, ...paperData } = data;
    return this.walkinsService.updatePaper(registrationId, paperData);
  }

  @Get('paper/:registrationId')
  getPaper(@Param('registrationId', ParseIntPipe) id: number) {
    return this.walkinsService.getPaper(id);
  }

  @Get('evaluation/:registrationId')
  getEvaluation(@Param('registrationId', ParseIntPipe) registrationId: number) {
    return this.walkinsService.getEvaluationData(registrationId);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() body: { ids: number[], action: string, data?: any }, @Request() req) {
    if (body.action === 'DELETE' && req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can perform bulk deletion');
    }
    return this.walkinsService.bulkUpdate(body.ids, body.action, body.data);
  }

  @Post('bulk-send-booking')
  bulkSendBooking(@Body() body: { registrationIds: number[], driveId: number }) {
    return this.walkinsService.bulkSendBookingEmail(body.registrationIds, body.driveId);
  }
}

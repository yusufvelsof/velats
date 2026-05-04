import { Module } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { EmailModule } from '../email/email.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [EmailModule, ActivityLogsModule],
  controllers: [InterviewsController],
  providers: [InterviewsService],
})
export class InterviewsModule {}

import { Module } from '@nestjs/common';
import { WalkinsService } from './walkins.service';
import { WalkinsController } from './walkins.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [WalkinsService],
  controllers: [WalkinsController],
})
export class WalkinsModule {}

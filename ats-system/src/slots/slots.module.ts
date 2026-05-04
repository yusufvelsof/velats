import { Module } from '@nestjs/common';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [EmailModule, PrismaModule],
  controllers: [SlotsController],
  providers: [SlotsService]
})
export class SlotsModule {}

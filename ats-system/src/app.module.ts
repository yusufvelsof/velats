import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CandidatesModule } from './candidates/candidates.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { InterviewsModule } from './interviews/interviews.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { EmailModule } from './email/email.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { NotesModule } from './notes/notes.module';
import { CompanyModule } from './company/company.module';
import { WalkinsModule } from './walkins/walkins.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { SlotsModule } from './slots/slots.module';
import { SearchModule } from './search/search.module';

import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CandidatesModule,
    JobsModule,
    ApplicationsModule,
    InterviewsModule,
    EmailModule,
    DashboardModule,
    ActivityLogsModule,
    NotesModule,
    CompanyModule,
    WalkinsModule,
    EmailTemplatesModule,
    SlotsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

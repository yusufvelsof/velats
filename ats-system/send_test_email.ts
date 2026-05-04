import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { EmailService } from './src/email/email.service';
import { PrismaService } from './src/prisma/prisma.service';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const prismaService = new PrismaService();
  const emailService = new EmailService(prismaService);

  console.log('Sending test email to Yusuf.azad@velsof.com...');

  try {
    await emailService.sendTemplateEmail({
      slug: 'interview-scheduled',
      to: 'Yusuf.azad@velsof.com',
      candidateId: 1, // Dummy ID
      variables: {
        candidate_name: 'Yusuf',
        job_title: 'Senior Developer',
        interview_level: 'Technical Round 1',
        interview_date_time: 'Thursday, 30 April 2026 at 10:00 AM IST',
        location: 'Virtual Zoom Meeting',
        interviewer_name: 'Recruitment Team',
      },
    });
    console.log('Test email sent successfully.');
  } catch (error) {
    console.error('Failed to send test email:', error);
  } finally {
    await prismaService.$disconnect();
  }
}

main();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const rescheduleBody = `
<div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    <!-- Header -->
    <div style="background:#e67e22; padding:30px; text-align:center;">
      <img src="cid:logo" alt="Velocity Logo" style="height:60px;" />
    </div>

    <!-- Body -->
    <div style="padding:25px; color:#333; line-height: 1.6; font-size: 15px;">
      <p>Hi {{candidate_name}},</p>

      <p>
        Your interview for the <strong>{{job_title}}</strong> position has been <strong>rescheduled</strong>.
      </p>

      <div style="background:#fff7ed; padding:20px; border-radius:12px; margin:25px 0; border: 1px solid #ffedd5; font-size: 15px;">
        <p style="margin-top: 0; margin-bottom: 15px; color: #9a3412;"><strong>New Interview Details:</strong></p>
        <p style="margin: 8px 0;"><strong>Round:</strong> {{interview_level}}</p>
        <p style="margin: 8px 0;"><strong>New Date & Time:</strong> {{interview_date_time}}</p>
        <p style="margin: 8px 0;"><strong>Location / Link:</strong> {{location}}</p>
        <p style="margin: 8px 0;"><strong>Updated by:</strong> {{interviewer_name}}</p>
      </div>

      <p>
        We apologize for any inconvenience this change may have caused. Please confirm if this new time works for you.
      </p>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="margin-bottom: 4px;">Thanks & Regards,</p>
        <p style="margin: 0; font-weight: bold;">HR Department</p>
        <p style="margin: 0; font-weight: bold;">Velocity Software Solutions Pvt. Ltd.</p>
        <p style="margin: 0; font-size: 13px;">
          <a href="http://www.velsof.com" style="color: #0b3c5d; text-decoration: none;">www.velsof.com</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#666;">
      © 2026 Velocity Software Solutions Pvt. Ltd.
    </div>
  </div>
</div>`;

  const cancelledBody = `
<div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    <!-- Header -->
    <div style="background:#c0392b; padding:30px; text-align:center;">
      <img src="cid:logo" alt="Velocity Logo" style="height:60px;" />
    </div>

    <!-- Body -->
    <div style="padding:25px; color:#333; line-height: 1.6; font-size: 15px;">
      <p>Hi {{candidate_name}},</p>

      <p>
        This is to inform you that your scheduled interview for the <strong>{{job_title}}</strong> position has been <strong>cancelled</strong>.
      </p>

      <div style="background:#fef2f2; padding:20px; border-radius:12px; margin:25px 0; border: 1px solid #fee2e2; font-size: 15px;">
        <p style="margin-top: 0; margin-bottom: 15px; color: #991b1b;"><strong>Cancelled Interview Info:</strong></p>
        <p style="margin: 8px 0;"><strong>Round:</strong> {{interview_level}}</p>
        <p style="margin: 8px 0;"><strong>Original Time:</strong> {{interview_date_time}}</p>
      </div>

      <p>
        We will contact you if there are any further updates regarding your application. Thank you for your interest in Velocity.
      </p>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="margin-bottom: 4px;">Thanks & Regards,</p>
        <p style="margin: 0; font-weight: bold;">HR Department</p>
        <p style="margin: 0; font-weight: bold;">Velocity Software Solutions Pvt. Ltd.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#666;">
      © 2026 Velocity Software Solutions Pvt. Ltd.
    </div>
  </div>
</div>`;

  await prisma.emailTemplate.update({
    where: { slug: 'interview-rescheduled' },
    data: { 
      subject: 'Interview Rescheduled: {{job_title}}',
      body: rescheduleBody 
    }
  });

  await prisma.emailTemplate.update({
    where: { slug: 'interview-cancelled' },
    data: { 
      subject: 'Interview Cancellation: {{job_title}}',
      body: cancelledBody 
    }
  });

  console.log('Reschedule and Cancellation email templates updated successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

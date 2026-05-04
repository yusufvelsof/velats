import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const body = `
<div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    <!-- Header -->
    <div style="background:#0b3c5d; padding:30px; text-align:center;">
      <img src="cid:logo" alt="Velocity Logo" style="height:60px;" />
    </div>

    <!-- Body -->
    <div style="padding:25px; color:#333; line-height: 1.6; font-size: 15px;">
      <p>Hi {{candidate_name}},</p>

      <p>
        We are pleased to invite you for an interview for the <strong>{{job_title}}</strong> position.
      </p>

      <div style="background:#f8fafc; padding:20px; border-radius:12px; margin:25px 0; border: 1px solid #e2e8f0; font-size: 15px;">
        <p style="margin-top: 0; margin-bottom: 15px;"><strong>Interview Details:</strong></p>
        <p style="margin: 8px 0;"><strong>Round:</strong> {{interview_level}}</p>
        <p style="margin: 8px 0;"><strong>Date & Time:</strong> {{interview_date_time}}</p>
        <p style="margin: 8px 0;"><strong>Location / Link:</strong> {{location}}</p>
        <p style="margin: 8px 0;"><strong>Scheduled by:</strong> {{interviewer_name}}</p>
        <p style="margin: 15px 0 0; color: #666; font-size: 13px; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
          <em>Note: Please ensure you reach the location 15 minutes before the scheduled time.</em>
        </p>
      </div>

      <p>
        Please confirm your availability by replying to this email.
      </p>

      <p>
        Looking forward to our conversation!
      </p>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="margin-bottom: 4px;">Thanks & Regards,</p>
        <p style="margin: 0; font-weight: bold;">HR Department</p>
        <p style="margin: 0; font-weight: bold;">Velocity Software Solutions Pvt. Ltd.</p>
        <p style="margin: 0; font-size: 13px;">
          <a href="http://www.velsof.com" style="color: #0b3c5d; text-decoration: none;">www.velsof.com</a> | 0120 424 3310
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#666;">
      © 2026 Velocity Software Solutions Pvt. Ltd.
    </div>
  </div>
</div>`;

  await prisma.emailTemplate.update({
    where: { slug: 'interview-scheduled' },
    data: { body }
  });

  console.log('Email template updated successfully.');
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

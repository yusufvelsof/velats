import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BRAND_BLUE = '#2b7dfb';
const LOGO_HEIGHT = '65px';

async function main() {
  const getHeader = (color: string) => `
    <div style="padding: 15px 40px; text-align: left; background: #ffffff;">
      <img src="cid:logo" alt="Velocity Logo" style="height:${LOGO_HEIGHT}; display: block;" />
    </div>
    <div style="height: 6px; background: ${color};"></div>`;

  const getLayout = (headerColor: string, bodyContent: string) => `
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color:#f1f5f9; padding:40px 15px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.04), 0 8px 10px -6px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
    ${getHeader(headerColor)}
    <div style="padding:40px; color:#334155; line-height: 1.7; font-size: 16px;">
      ${bodyContent}
      
      <div style="margin: 30px 0; padding: 15px 20px; background-color: #f8fafc; border-left: 4px solid #cbd5e1; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #475569; font-weight: 500;">
          <strong>Note:</strong> We kindly request you to arrive at the venue or join the virtual meeting <strong>15 minutes prior</strong> to your scheduled time to ensure a prompt start.
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #f1f5f9;">
        <p style="margin-bottom: 4px; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Best Regards,</p>
        <p style="margin: 0; font-weight: 700; color: #1e293b; font-size: 17px;">Talent Acquisition Team</p>
        <p style="margin: 2px 0; color: #64748b; font-size: 14px;">Velocity Software Solutions Pvt. Ltd.</p>
        <p style="margin: 12px 0 0 0;">
          <a href="https://www.velsof.com" style="color: ${BRAND_BLUE}; text-decoration: none; font-weight: 600; font-size: 14px;">Visit our Careers Page</a>
        </p>
      </div>
    </div>
    <div style="background:#f8fafc; padding:25px; text-align:center; border-top: 1px solid #f1f5f9;">
       <p style="margin:0; font-size:11px; color:#94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
         Velocity ATS • Secure Recruitment Portal
       </p>
    </div>
  </div>
</div>`;

  const templates = [
    {
      slug: 'interview-scheduled',
      subject: 'Interview Confirmation: {{job_title}} | {{candidate_name}}',
      addSignature: true,
      body: getLayout(BRAND_BLUE, `
      <h1 style="margin: 0 0 25px 0; color: #0f172a; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Interview Confirmed</h1>
      <p style="margin-bottom: 25px;">Hello <strong>{{candidate_name}}</strong>,</p>
      <p>Thank you for your interest in joining <strong>Velocity</strong>. We are pleased to confirm your interview for the <strong>{{job_title}}</strong> position.</p>
      
      <div style="margin: 35px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #f8fafc; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Schedule Details</span>
        </div>
        <div style="padding: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 110px;">Round</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">{{interview_level}}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date & Time</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">{{interview_date_time}}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Location</td><td style="padding: 8px 0; font-weight: 600; color: #2b7dfb;">{{location}}</td></tr>
          </table>
        </div>
      </div>
      `)
    },
    {
      slug: 'interview-rescheduled',
      subject: 'Rescheduled: Interview for {{job_title}} | {{candidate_name}}',
      addSignature: true,
      body: getLayout('#f59e0b', `
      <h1 style="margin: 0 0 25px 0; color: #92400e; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Schedule Updated</h1>
      <p style="margin-bottom: 25px;">Hello <strong>{{candidate_name}}</strong>,</p>
      <p>Your interview for the <strong>{{job_title}}</strong> position has been updated to a new time slot as per our recent conversation.</p>
      
      <div style="margin: 35px 0; border: 1px solid #fef3c7; border-radius: 12px; overflow: hidden;">
        <div style="background: #fffbeb; padding: 12px 20px; border-bottom: 1px solid #fef3c7;">
          <span style="font-size: 12px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1px;">New Schedule</span>
        </div>
        <div style="padding: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #b45309; font-size: 14px; width: 110px; opacity: 0.8;">New Time</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">{{interview_date_time}}</td></tr>
            <tr><td style="padding: 8px 0; color: #b45309; font-size: 14px; opacity: 0.8;">Location</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">{{location}}</td></tr>
          </table>
        </div>
      </div>
      `)
    },
    {
      slug: 'interview-cancelled',
      subject: 'Cancellation Notice: {{job_title}} Interview | {{candidate_name}}',
      addSignature: true,
      body: getLayout('#ef4444', `
      <h1 style="margin: 0 0 25px 0; color: #991b1b; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Interview Cancelled</h1>
      <p style="margin-bottom: 25px;">Hello <strong>{{candidate_name}}</strong>,</p>
      <p>This is to inform you that your scheduled interview for the <strong>{{job_title}}</strong> position has been cancelled.</p>
      
      <div style="margin: 35px 0; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden;">
        <div style="background: #fef2f2; padding: 12px 20px; border-bottom: 1px solid #fee2e2;">
          <span style="font-size: 12px; font-weight: 800; color: #b91c1c; text-transform: uppercase; letter-spacing: 1px;">Cancelled Slot</span>
        </div>
        <div style="padding: 20px;">
          <p style="margin: 0; font-weight: 600; color: #1e293b;">{{interview_date_time}}</p>
        </div>
      </div>
      <p>We will reach out to you if there are further updates regarding your candidacy.</p>
      `)
    }
  ];

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { slug: t.slug },
      update: { 
        subject: t.subject,
        body: t.body,
        addSignature: t.addSignature
      },
      create: {
        slug: t.slug,
        name: t.slug.replace(/-/g, ' ').toUpperCase(),
        subject: t.subject,
        body: t.body,
        addSignature: t.addSignature
      }
    });
  }

  console.log('All email templates updated with new branding and fixed variables.');
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

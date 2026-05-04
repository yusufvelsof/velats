import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'hr@velsof.com';
  const password = 'velsof123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const hrUser = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      firstName: 'Velocity',
      lastName: 'Admin',
      alias: 'V.Admin',
    },
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Velocity',
      lastName: 'Admin',
      alias: 'V.Admin',
    },
  });

  console.log({ hrUser });

  // Initialize/Lock Company Settings with User Provided Values
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {
      departments: [
        "Digital Marketing", "Finance", "HR", "Management", 
        "Microsoft Technology", "Sales", "Software Development and Management"
      ],
      technologies: [
        "Software Engineer", "Sr. Software Engineer", "Business Analyst", "Sr. Business Analyst",
        "HR Executive", "Sr. HR Executive", "HR Manager", "Manager", "SEO Executive",
        "Digital Marketing Executive", "Desktop Support Engineer", "Graphics Designer",
        "Sr. Graphics Designer", "Intern", "Office Boy", "Project Manager", "Sr. Project Manager",
        "Web Designer", "Sr. Web Designer", "Sr. Manager", "Team Lead", "Tech. Support Executive",
        "Test Engineer", "UI/UX Designer", "Software Testing cum Business Analyst",
        "Software Testing cum Business Analyst Intern"
      ],
      interviewLevels: [
        "GENERAL", "INTERNAL", "ONLINE", "TELEPHONIC", "HR ROUND", 
        "LEVEL 1", "LEVEL 2", "LEVEL 3", "LEVEL 4"
      ],
      feedbackSchema: [
        { category: "HIRED", subCategories: ["Hired"] },
        { category: "ON-HOLD", subCategories: ["On-Hold"] },
        { category: "SHORTLISTED", subCategories: ["Move to next"] },
        { category: "UNPREPARED", subCategories: ["Reschedule"] },
        { 
          category: "REJECTED", 
          subCategories: [
            "Culture Fitment", "Doesn't know coding", "Not prepared", "Cheated",
            "Incomplete Application", "Better qualification candidate selected",
            "Backout", "Unresponsive", "Not ok for Bond", "Not ok with T&C",
            "Bad Attitude", "Not Keen for Job", "Having better offer", "Not stable",
            "Already hired many from same college", "Bad communication", "Other",
            "High Salary Expectation"
          ] 
        }
      ]
    },
    create: {
      id: 1,
      name: 'Velocity Software Solutions Pvt. Ltd.',
      departments: [
        "Digital Marketing", "Finance", "HR", "Management", 
        "Microsoft Technology", "Sales", "Software Development and Management"
      ],
      technologies: [
        "Software Engineer", "Sr. Software Engineer", "Business Analyst", "Sr. Business Analyst",
        "HR Executive", "Sr. HR Executive", "HR Manager", "Manager", "SEO Executive",
        "Digital Marketing Executive", "Desktop Support Engineer", "Graphics Designer",
        "Sr. Graphics Designer", "Intern", "Office Boy", "Project Manager", "Sr. Project Manager",
        "Web Designer", "Sr. Web Designer", "Sr. Manager", "Team Lead", "Tech. Support Executive",
        "Test Engineer", "UI/UX Designer", "Software Testing cum Business Analyst",
        "Software Testing cum Business Analyst Intern"
      ],
      interviewLevels: [
        "GENERAL", "INTERNAL", "ONLINE", "TELEPHONIC", "HR ROUND", 
        "LEVEL 1", "LEVEL 2", "LEVEL 3", "LEVEL 4"
      ],
      feedbackSchema: [
        { category: "HIRED", subCategories: ["Hired"] },
        { category: "ON-HOLD", subCategories: ["On-Hold"] },
        { category: "SHORTLISTED", subCategories: ["Move to next"] },
        { category: "UNPREPARED", subCategories: ["Reschedule"] },
        { 
          category: "REJECTED", 
          subCategories: [
            "Culture Fitment", "Doesn't know coding", "Not prepared", "Cheated",
            "Incomplete Application", "Better qualification candidate selected",
            "Backout", "Unresponsive", "Not ok for Bond", "Not ok with T&C",
            "Bad Attitude", "Not Keen for Job", "Having better offer", "Not stable",
            "Already hired many from same college", "Bad communication", "Other",
            "High Salary Expectation"
          ] 
        }
      ]
    }
  });

  console.log('Company settings locked.');

  // Initialize Standard Email Templates
  await prisma.emailTemplate.upsert({
    where: { slug: 'interview-scheduled' },
    update: {
      subject: 'Interview Scheduled: {{job_title}} | {{candidate_name}}',
      body: `
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
        <p style="margin: 15px 0 0; color: #666; font-size: 13px; border-top: 1px dashed #cbd5e1; pt-10px;">
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
</div>`
    },
    create: {
      slug: 'interview-scheduled',
      name: 'Interview Scheduled',
      subject: 'Interview Scheduled: {{job_title}} | {{candidate_name}}',
      body: `
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
        <p style="margin: 15px 0 0; color: #666; font-size: 13px; border-top: 1px dashed #cbd5e1; pt-10px;">
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
</div>`
    }
  });

  await prisma.emailTemplate.upsert({
    where: { slug: 'interview-rescheduled' },
    update: {},
    create: {
      slug: 'interview-rescheduled',
      name: 'Interview Rescheduled',
      subject: 'Interview Rescheduled: {{jobTitle}}',
      body: `Hi {{candidateName}},

Your interview for the {{jobTitle}} position has been rescheduled.

New Details:
Round: {{interviewLevel}}
New Date: {{date}}
Location/URL: {{location}}

We apologize for any inconvenience.

Best regards,
Velocity Recruitment Team`,
    }
  });

  await prisma.emailTemplate.upsert({
    where: { slug: 'interview-cancelled' },
    update: {},
    create: {
      slug: 'interview-cancelled',
      name: 'Interview Cancelled',
      subject: 'Interview Cancellation: {{jobTitle}}',
      body: `Hi {{candidateName}},

Your scheduled interview for the {{jobTitle}} position on {{date}} has been cancelled.

We will contact you if there are any further updates regarding your application.

Best regards,
Velocity Recruitment Team`,
    }
  });

  // New Status Change Templates
  await prisma.emailTemplate.upsert({
    where: { slug: 'candidate-shortlisted' },
    update: {},
    create: {
      slug: 'candidate-shortlisted',
      name: 'Candidate Shortlisted',
      subject: 'Great news! You are shortlisted for {{job_title}}',
      body: `Hi {{candidate_name}},

Congratulations! You have been shortlisted for the {{job_title}} position at {{company_name}}.

Our recruitment team will contact you soon regarding the next steps in the evaluation process.

Best regards,
Recruitment Team
{{company_name}}`,
    }
  });

  await prisma.emailTemplate.upsert({
    where: { slug: 'candidate-rejected' },
    update: {},
    create: {
      slug: 'candidate-rejected',
      name: 'Candidate Rejected',
      subject: 'Update regarding your application for {{job_title}}',
      body: `Hi {{candidate_name}},

Thank you for the time you invested in applying for the {{job_title}} position at {{company_name}}.

After careful review, we regret to inform you that we will not be moving forward with your application at this time. We will keep your profile in our database for future opportunities that match your skill set.

We wish you the very best in your job search.

Best regards,
Recruitment Team
{{company_name}}`,
    }
  });

  await prisma.emailTemplate.upsert({
    where: { slug: 'candidate-offer' },
    update: {},
    create: {
      slug: 'candidate-offer',
      name: 'Candidate Offer',
      subject: 'Job Offer: {{job_title}} at {{company_name}}',
      body: `Hi {{candidate_name}},

We are delighted to offer you the position of {{job_title}} at {{company_name}}!

We were very impressed with your skills and experience, and we believe you will be a valuable addition to our team.

Please find the details of your offer in the portal or attached documents. We look forward to your positive response.

Best regards,
Recruitment Team
{{company_name}}`,
    }
  });

  await prisma.emailTemplate.upsert({
    where: { slug: 'candidate-hired' },
    update: {},
    create: {
      slug: 'candidate-hired',
      name: 'Candidate Hired',
      subject: 'Welcome to the team! {{job_title}}',
      body: `Hi {{candidate_name}},

A warm welcome to {{company_name}}! 

We are excited to have you join us as {{job_title}}. Your onboarding process will begin shortly, and we will share more details soon.

Welcome aboard!

Best regards,
HR Team
{{company_name}}`,
    }
  });

  console.log('Email templates seeded.');

  // Add Walk-in Demo Data
  const walkinCampaign = await prisma.walkInCampaign.create({
    data: {
      title: 'Mega Talent Drive - May 2026',
      source: 'LinkedIn',
      profile: 'Senior Node.js Developer',
      description: 'Hiring experts for our high-scale cloud infrastructure team.',
      notes: 'Internal drive for V-Soft Engineering department.',
    }
  });

  await prisma.walkInRegistration.createMany({
    data: [
      {
        campaignId: walkinCampaign.id,
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        mobile: '+91 9876543210',
        gender: 'FEMALE',
        graduationDegree: 'B.Tech CS - 2022',
        experienceType: 'Job',
        experienceDuration: '2 Years',
        technologies: 'React, NestJS, PostgreSQL',
        status: 'REGISTERED'
      },
      {
        campaignId: walkinCampaign.id,
        name: 'Bob Smith',
        email: 'bob.smith@demo.com',
        mobile: '+91 9123456789',
        gender: 'MALE',
        graduationDegree: 'MCA - 2021',
        experienceType: 'Job',
        experienceDuration: '3.5 Years',
        technologies: 'Node.js, Docker, Kubernetes',
        status: 'SHORTLISTED_APTI'
      }
    ]
  });

  console.log('Walk-in demo data seeded.');

  // Add Active Jobs for Slot Management testing
  await prisma.job.createMany({
    data: [
      {
        title: 'Senior Frontend Developer',
        description: 'Expert in React and Tailwind CSS.',
        status: 'OPEN',
        location: 'Noida (Office)',
        jobType: 'Full-time',
        department: 'Software Development and Management'
      },
      {
        title: 'Node.js Backend Engineer',
        description: 'Strong knowledge of NestJS and PostgreSQL.',
        status: 'OPEN',
        location: 'Remote',
        jobType: 'Full-time',
        department: 'Software Development and Management'
      },
      {
        title: 'UI/UX Designer',
        description: 'Proficient in Figma and Adobe Creative Suite.',
        status: 'OPEN',
        location: 'Noida (Office)',
        jobType: 'Full-time',
        department: 'Design'
      }
    ]
  });

  console.log('Active jobs seeded.');
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

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        html,
      });
      console.log(`[EmailService] Success: Email sent to ${to}`);
    } catch (error) {
      console.error('[EmailService] SMTP Error:', error.message);
    }
  }

  private getLayout(bodyContent: string, headerColor: string = '#2b7dfb'): string {
    return `
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color:#f1f5f9; padding:40px 15px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.04), 0 8px 10px -6px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
    <div style="padding: 15px 40px; text-align: left; background: #ffffff;">
      <img src="cid:logo" alt="Velocity Logo" style="height:65px; display: block;" />
    </div>
    <div style="height: 6px; background: ${headerColor};"></div>
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
          <a href="https://www.velsof.com" style="color: #2b7dfb; text-decoration: none; font-weight: 600; font-size: 14px;">Visit our Careers Page</a>
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
  }

  async sendRawEmail(params: {
    to: string;
    from?: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
    attachments?: any[];
    candidateId: number;
    userId?: number;
    emailType?: string;
  }) {
    const { to, from, cc, bcc, subject, body, attachments, candidateId, userId, emailType } = params;

    try {
      const finalAttachments = attachments?.map(att => {
        let attachmentPath = att.url;
        
        // If it's a relative path starting with / or ./, resolve it against process.cwd()
        if (attachmentPath.startsWith('/') || attachmentPath.startsWith('./')) {
          // Remove leading slash if present to avoid drive-root issues on Windows
          const normalizedPath = attachmentPath.startsWith('/') ? attachmentPath.substring(1) : attachmentPath;
          attachmentPath = join(process.cwd(), normalizedPath);
        }

        return {
          filename: att.name,
          path: attachmentPath,
        };
      }) || [];

      // Always attach logo if it exists
      let logoPath = join(process.cwd(), 'Logo.png');
      if (!fs.existsSync(logoPath)) {
        logoPath = join(process.cwd(), 'Logo White.png');
      }

      if (fs.existsSync(logoPath)) {
        finalAttachments.push({
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo'
        } as any);
      }

      // Determine header color based on subject keywords
      let headerColor = '#2b7dfb'; // Standard blue
      if (subject.toLowerCase().includes('rescheduled')) headerColor = '#f59e0b'; // Amber
      if (subject.toLowerCase().includes('cancelled')) headerColor = '#ef4444'; // Red

      // Apply the branded layout if not already wrapped
      let finalHtml = body;
      const isAlreadyWrapped = body.includes('id="branded-layout"') || body.includes('Velocity ATS • Secure Recruitment Portal');
      
      if (!isAlreadyWrapped) {
        finalHtml = this.getLayout(body, headerColor);
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        replyTo: from || process.env.SMTP_FROM,
        to,
        cc: cc && cc.trim() !== '' ? cc : undefined,
        bcc: bcc && bcc.trim() !== '' ? bcc : undefined,
        subject: subject || '(No Subject)',
        html: finalHtml,
        attachments: finalAttachments,
      });

      // Log to EmailLog
      await this.prisma.emailLog.create({
        data: {
          candidateId,
          userId,
          to,
          cc: cc && cc.trim() !== '' ? cc : null,
          bcc: bcc && bcc.trim() !== '' ? bcc : null,
          subject: subject || '(No Subject)',
          body: finalHtml,
          attachments: attachments ? JSON.parse(JSON.stringify(attachments)) : undefined,
          emailType: emailType || 'custom',
        },
      });

      return { success: true };
    } catch (error) {
      console.error('[EmailService] Raw Email Error:', error.message);
      throw error;
    }
  }

  async sendTemplateEmail(params: {
    slug: string;
    to: string;
    variables: Record<string, string>;
    candidateId: number;
    userId?: number;
    emailType?: string;
  }) {
    const { slug, to, variables, candidateId, userId, emailType } = params;
    const template = await this.prisma.emailTemplate.findUnique({ where: { slug } });
    
    if (!template) {
      console.warn(`[EmailService] Template with slug ${slug} not found.`);
      return;
    }

    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(placeholder, value || '');
      body = body.replace(placeholder, value || '');
    }

    // Append user signature if requested
    if (template.addSignature && userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { signature: true },
      });
      if (user?.signature) {
        body += `<br/><br/>${user.signature}`;
      }
    }

    // Use sendRawEmail to ensure logging
    return this.sendRawEmail({
      to,
      subject,
      body,
      candidateId,
      userId,
      emailType: emailType || 'system',
    });
  }
}


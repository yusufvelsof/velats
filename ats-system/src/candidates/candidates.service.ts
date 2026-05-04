import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { Candidate } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { EmailService } from '../email/email.service';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import { Response } from 'express';
const pdf = require('pdf-parse');

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private activityLogsService: ActivityLogsService,
    private emailService: EmailService,
  ) {}

  async downloadAttachment(id: number, res: Response) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
    if (!attachment) throw new NotFoundException('Attachment not found');

    const relativePath = attachment.url.startsWith('/') ? attachment.url.substring(1) : attachment.url;
    const filePath = path.join(process.cwd(), relativePath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }

    return res.download(filePath, attachment.name);
  }

  async previewAttachment(id: number) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
    if (!attachment) throw new NotFoundException('Attachment not found');

    const relativePath = attachment.url.startsWith('/') ? attachment.url.substring(1) : attachment.url;
    const filePath = path.join(process.cwd(), relativePath);

    if (attachment.type.toLowerCase() === 'docx') {
      try {
        const result = await mammoth.convertToHtml({ path: filePath });
        return { type: 'html', content: result.value };
      } catch (err) {
        console.error('Mammoth conversion error:', err);
        return { type: 'error', message: 'Failed to convert document' };
      }
    }
    
    return { type: 'url', content: attachment.url };
  }

  async create(createCandidateDto: CreateCandidateDto, userId?: number): Promise<Candidate> {
    const { jobId, education, experience, mobile, ...candidateData } = createCandidateDto;
    
    // 1. Check for Duplicate
    const existing = await this.prisma.candidate.findFirst({
      where: {
        OR: [
          { email: candidateData.email },
          { phone: mobile && mobile !== '' ? mobile : undefined }
        ].filter(Boolean) as any
      }
    });

    if (existing) {
      if (jobId) {
        // Self-registration merge: Update only empty cells and add Job application
        const updateData: any = {};
        for (const [key, value] of Object.entries(candidateData)) {
          if (value !== null && value !== '' && value !== undefined) {
            if ((existing as any)[key] === null || (existing as any)[key] === '') {
              updateData[key] = value;
            }
          }
        }
        
        // Handle mobile/phone mapping for update
        if (mobile && (!existing.phone || existing.phone === '')) {
           updateData.phone = mobile;
        }

        if (Object.keys(updateData).length > 0) {
          await this.prisma.candidate.update({ where: { id: existing.id }, data: updateData });
        }

        const existingApp = await this.prisma.application.findFirst({
          where: { candidateId: existing.id, jobId }
        });
        if (!existingApp) {
          await this.prisma.application.create({
            data: { candidateId: existing.id, jobId, status: 'APPLIED' }
          });
        } else if (existingApp.status !== 'APPLIED') {
          await this.prisma.application.update({
            where: { id: existingApp.id },
            data: { status: 'APPLIED' }
          });
        }

        await this.activityLogsService.create({
          action: 'UPDATED',
          entityType: 'CANDIDATE',
          entityId: existing.id,
          description: `Existing candidate ${existing.name} reapplied. Empty profile fields updated.`,
          userId,
        });

        return this.findOne(existing.id);
      }
      throw new ConflictException('Candidate already exists with this email or phone number');
    }

    // 2. Mapping Layer: Ensure 'name' is populated
    let fullName = candidateData.name || '';
    if (!fullName && candidateData.lastName) {
      fullName = `${candidateData.firstName ? candidateData.firstName + ' ' : ''}${candidateData.lastName}`;
    }

    // 3. Create Candidate
    const candidate = await this.prisma.candidate.create({
      data: {
        ...candidateData,
        name: fullName,
        phone: mobile,
        education: education ? { create: education as any } : undefined,
        experience: experience ? { create: experience as any } : undefined,
      } as any,
    });

    // 4. Create Application if Job ID provided
    if (jobId) {
      await this.prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobId,
          status: 'APPLIED'
        }
      });
    }

    // 5. Sync Resume to Attachment if present
    if (candidate.resumeUrl) {
      await this.syncResumeToAttachment(candidate.id, candidate.resumeUrl, userId);
    }

    await this.activityLogsService.create({
      action: 'CREATED',
      entityType: 'CANDIDATE',
      entityId: candidate.id,
      description: `Candidate ${candidate.name} created manually.`,
      userId,
    });

    return candidate;
  }

  private async syncResumeToAttachment(candidateId: number, resumeUrl: string, userId?: number) {
    if (!resumeUrl) return;

    const existingResume = await this.prisma.attachment.findFirst({
      where: { candidateId, category: 'Resume' }
    });

    const fileName = resumeUrl.split('/').pop() || 'Resume';
    const extension = resumeUrl.includes('.') ? resumeUrl.split('.').pop()?.toUpperCase() || 'PDF' : 'PDF';

    if (existingResume) {
      if (existingResume.url !== resumeUrl) {
        await this.prisma.attachment.update({
          where: { id: existingResume.id },
          data: { 
            url: resumeUrl,
            name: fileName,
            type: extension,
            modifiedById: userId 
          }
        });
      }
    } else {
      await this.prisma.attachment.create({
        data: {
          candidateId,
          name: fileName,
          url: resumeUrl,
          type: extension,
          category: 'Resume',
          uploadedById: userId,
          modifiedById: userId,
        }
      });
    }
  }

  async findAll(search?: string, filters?: any): Promise<Candidate[]> {
    const where: any = { deletedAt: null };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { skillSet: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filters?.status) where.status = filters.status;
    if (filters?.source) where.source = filters.source;
    if (filters?.ownerId) where.ownerId = parseInt(filters.ownerId);
    if (filters?.experienceYears) where.experienceYears = filters.experienceYears;

    return this.prisma.candidate.findMany({
      where,
      include: {
        applications: {
          include: { job: true },
          orderBy: { createdAt: 'desc' }
        },
        owner: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Candidate> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        education: true,
        experience: true,
        attachments: {
          include: {
            uploadedBy: { select: { id: true, firstName: true, lastName: true } },
            modifiedBy: { select: { id: true, firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        applications: {
          include: { 
            job: true, 
            interviews: { orderBy: { date: 'asc' } },
            notes: { include: { user: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        notes: {
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        },
        emailHistory: {
          include: { user: true },
          orderBy: { sentAt: 'desc' }
        },
        owner: true
      }
    });
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    return candidate;
  }

  async addAttachment(candidateId: number, file: Express.Multer.File, category: string, userId?: number) {
    const attachment = await this.prisma.attachment.create({
      data: {
        candidateId,
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        type: path.extname(file.originalname).substring(1).toUpperCase(),
        size: file.size,
        category,
        uploadedById: userId,
        modifiedById: userId,
      },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        modifiedBy: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    await this.activityLogsService.create({
      action: 'ATTACHMENT_ADDED',
      entityType: 'CANDIDATE',
      entityId: candidateId,
      description: `New attachment "${file.originalname}" added to category "${category}".`,
      userId,
    });

    return attachment;
  }

  async removeAttachment(id: number, userId?: number) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
    if (!attachment) throw new NotFoundException('Attachment not found');

    await this.prisma.attachment.delete({ where: { id } });

    await this.activityLogsService.create({
      action: 'ATTACHMENT_REMOVED',
      entityType: 'CANDIDATE',
      entityId: attachment.candidateId,
      description: `Attachment "${attachment.name}" was removed.`,
      userId,
    });

    return { success: true };
  }

  async checkDuplicate(email: string, mobile?: string): Promise<Candidate | null> {
    return this.prisma.candidate.findFirst({
      where: {
        OR: [
          { email },
          { phone: mobile && mobile !== '' ? mobile : undefined }
        ].filter(Boolean) as any
      },
      include: {
        applications: { include: { job: true } }
      }
    });
  }

  async update(id: number, updateCandidateDto: UpdateCandidateDto, userId?: number): Promise<Candidate> {
    const { education, experience, mobile, ...data } = updateCandidateDto as any;
    
    try {
      const existing = await this.prisma.candidate.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException(`Candidate with ID ${id} not found`);

      // Prepare update data
      const updateData: any = { ...data };
      
      if (mobile) {
        updateData.phone = mobile;
      }

      // If name is not provided but firstName/lastName are, update name
      if (!updateData.name && (updateData.firstName || updateData.lastName)) {
        const firstName = updateData.firstName || existing.firstName || '';
        const lastName = updateData.lastName || existing.lastName || '';
        updateData.name = `${firstName} ${lastName}`.trim();
      }

      const candidate = await this.prisma.candidate.update({
        where: { id },
        data: updateData,
      });

      // Sync Resume to Attachment if resumeUrl was updated
      if (candidate.resumeUrl) {
        await this.syncResumeToAttachment(candidate.id, candidate.resumeUrl, userId);
      }

      await this.activityLogsService.create({
        action: 'UPDATED',
        entityType: 'CANDIDATE',
        entityId: id,
        description: `Candidate profile updated.`,
        userId,
      });

      return candidate;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Update candidate error:', error);
      throw new BadRequestException('Update failed. Verify data types.');
    }
  }

  async updateStatus(id: number, data: { status: string }, userId?: number) {
    const candidate = await this.prisma.candidate.update({
      where: { id },
      data: { status: data.status },
    });

    await this.activityLogsService.create({
      action: 'STATUS_CHANGE',
      entityType: 'CANDIDATE',
      entityId: id,
      description: `Candidate status updated to ${data.status}.`,
      userId,
    });

    return candidate;
  }

  async updateApplicationStatus(appId: number, data: { status: string, offeredSalary?: string, offerStatus?: string, joiningDate?: Date }, userId?: number) {
    const oldApp = await this.prisma.application.findUnique({ where: { id: appId } });
    
    const app = await this.prisma.application.update({
      where: { id: appId },
      data: {
        status: data.status,
        offeredSalary: data.offeredSalary,
        offerStatus: data.offerStatus,
        joiningDate: data.joiningDate
      },
      include: { candidate: true, job: true }
    });

    // Trigger email on status change
    if (oldApp && oldApp.status !== data.status) {
      await this.triggerStatusEmail(data.status, app, userId);
    }

    await this.activityLogsService.create({
      action: 'STATUS_CHANGE',
      entityType: 'APPLICATION',
      entityId: appId,
      description: `Application for ${app.candidate.name} in role ${app.job.title} moved to ${data.status}.`,
      userId,
    });

    return app;
  }

  private async triggerStatusEmail(status: string, application: any, userId?: number) {
    try {
      const candidate = application.candidate;
      const job = application.job;

      if (!candidate?.email) return;

      const statusMap: Record<string, string> = {
        'SHORTLISTED': 'candidate-shortlisted',
        'REJECTED': 'candidate-rejected',
        'HIRED': 'candidate-hired',
        'OFFER': 'candidate-offer',
      };

      const slug = statusMap[status];
      if (!slug) return;

      await this.emailService.sendTemplateEmail({
        slug,
        to: candidate.email,
        candidateId: candidate.id,
        userId: userId || application.userId || application.ownerId || 1,
        emailType: 'status_change',
        variables: {
          candidate_name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.name || 'Candidate',
          job_title: job?.title || 'Open Position',
          company_name: 'Velocity Software Solutions Pvt. Ltd.'
        }
      });
    } catch (error) {
      console.error('[Status Email Failed]', {
        applicationId: application.id,
        candidateId: application.candidate?.id,
        status,
        error: error.message
      });
    }
  }

  async mergeCandidates(targetId: number, sourceId: number) {
    // 1. Move all relations from source to target
    await this.prisma.$transaction([
      this.prisma.application.updateMany({ where: { candidateId: sourceId }, data: { candidateId: targetId } }),
      this.prisma.education.updateMany({ where: { candidateId: sourceId }, data: { candidateId: targetId } }),
      this.prisma.experience.updateMany({ where: { candidateId: sourceId }, data: { candidateId: targetId } }),
      this.prisma.attachment.updateMany({ where: { candidateId: sourceId }, data: { candidateId: targetId } }),
      this.prisma.note.updateMany({ where: { candidateId: sourceId }, data: { candidateId: targetId } }),
      this.prisma.emailLog.updateMany({ where: { candidateId: sourceId }, data: { candidateId: targetId } }),
      // 2. Delete source
      this.prisma.candidate.delete({ where: { id: sourceId } })
    ]);

    return this.findOne(targetId);
  }

  async getPrefillData(source: string, id: string) {
    if (source === 'walkin') {
      const reg = await this.prisma.walkInRegistration.findUnique({
        where: { id: parseInt(id) },
      });
      if (!reg) throw new NotFoundException('Walk-in registration not found');

      const nameParts = reg.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';

      return {
        firstName,
        lastName,
        email: reg.email,
        mobile: reg.mobile,
        gender: reg.gender,
        currentLocation: reg.currentLocation,
        hometown: reg.hometown,
        experienceYears: reg.experienceDuration,
        highestQualification: reg.graduationDegree,
        currentEmployer: reg.prevCompanyName,
        currentJobTitle: reg.prevDesignation,
        currentSalary: reg.currentCTC,
        expectedSalary: reg.expectedCTC,
        skillSet: reg.technologies,
        source: 'Walk-in',
        education: [
          { institute: reg.graduationCollege, degree: reg.graduationDegree, fromMonth: '', fromYear: '', toMonth: '', toYear: reg.graduationYear, isCurrent: false },
          reg.pgDegree ? { institute: reg.pgCollege, degree: reg.pgDegree, fromMonth: '', fromYear: '', toMonth: '', toYear: reg.pgYear, isCurrent: false } : null
        ].filter(Boolean),
        experience: reg.prevCompanyName ? [
          { company: reg.prevCompanyName, title: reg.prevDesignation, fromMonth: '', fromYear: '', toMonth: '', toYear: reg.experienceDuration, summary: reg.roleDescription, isCurrent: false }
        ] : []
      };
    }

    if (source === 'application') {
      const app = await this.prisma.application.findUnique({
        where: { id: parseInt(id) },
        include: { candidate: true, job: true }
      });
      if (!app) throw new NotFoundException('Application not found');

      const nameParts = app.candidate.name.trim().split(/\s+/);
      
      return {
        firstName: app.candidate.firstName || nameParts[0] || '',
        lastName: app.candidate.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown'),
        email: app.candidate.email,
        mobile: app.candidate.phone,
        currentLocation: app.candidate.currentLocation,
        skillSet: app.candidate.technologies,
        experienceYears: app.candidate.experienceYears,
        source: 'Job Portal',
        jobId: app.jobId
      };
    }

    return {};
  }

  async parseResume(file: Express.Multer.File) {
    const filePath = path.join(process.cwd(), 'uploads', file.filename);
    let rawText = '';

    // 1. Extract Raw Text based on file type
    try {
      if (file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        rawText = data.text;
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ path: filePath });
        rawText = result.value;
      } else {
        // Fallback for plain text or others
        rawText = fs.readFileSync(filePath, 'utf8');
      }
    } catch (err) {
      console.error('[Parser Error] Failed to read file:', err);
      throw new BadRequestException('Could not read resume content.');
    }

    // 2. Get Parsing Settings
    const company = await this.prisma.company.findFirst();
    const settings = (company?.parserSettings as any) || { engine: 'local' };

    // 3. Decide Engine
    if (settings.engine !== 'local' && settings.apiKey) {
      try {
        return await this.parseWithAI(rawText, settings.engine, settings.apiKey, file.filename);
      } catch (err) {
        console.error(`[AI Parser Error] ${settings.engine} failed, falling back to local:`, err.message);
        // Fallback to local if AI fails
      }
    }

    // 4. Local Regex Parsing (Fallback)
    return this.parseLocal(rawText, file.filename, file.originalname);
  }

  private async parseWithAI(text: string, engine: string, key: string, filename: string) {
    const prompt = `
      Extract candidate details from the following resume text. 
      Return ONLY a valid JSON object with these keys: 
      firstName, lastName, email, mobile, skillSet, experienceYears, currentJobTitle, currentLocation.
      If a field is not found, use an empty string.
      
      Resume Text:
      ${text.substring(0, 4000)} 
    `;

    let data: any = {};
    let engineName = '';

    if (engine === 'gemini') {
      engineName = 'Google Gemini AI';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const resJson = await response.json();
      const rawContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      data = JSON.parse(rawContent.replace(/```json|```/g, '').trim());
    } else if (engine === 'openai') {
      engineName = 'OpenAI GPT-4';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });
      const resJson = await response.json();
      data = JSON.parse(resJson.choices?.[0]?.message?.content || '{}');
    }

    return {
      success: true,
      data: {
        ...data,
        name: `${data.firstName} ${data.lastName}`.trim(),
        resumeUrl: `/uploads/${filename}`
      },
      confidence: 95,
      parsingEngine: engineName
    };
  }

  private parseLocal(text: string, filename: string, originalName: string) {
    // Basic Regex Extraction
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?\d{1,3}[- ]?)?\d{10}/);
    
    // Guess Name from first line
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    const guessedName = lines[0] || originalName.split('.')[0];
    const nameParts = guessedName.split(' ');

    return {
      success: true,
      data: {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || 'Candidate',
        name: guessedName,
        email: emailMatch ? emailMatch[0] : '',
        mobile: phoneMatch ? phoneMatch[0] : '',
        skillSet: '',
        experienceYears: '',
        currentJobTitle: '',
        currentLocation: '',
        resumeUrl: `/uploads/${filename}`
      },
      confidence: 65,
      parsingEngine: 'Local Heuristics (Open Source)'
    };
  }

  async remove(id: number): Promise<Candidate> {
    try {
      return await this.prisma.candidate.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (error) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
  }
}

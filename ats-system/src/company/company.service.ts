import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getDetails() {
    let company = await this.prisma.company.findFirst();
    if (!company) {
      // Create initial record if it doesn't exist
      company = await this.prisma.company.create({
        data: { name: 'Velocity Software Solutions Pvt. Ltd.' },
      });
    }
    return company;
  }

  async update(updateData: any) {
    const existing = await this.getDetails();
    
    // Handle JSON deep merge for formConfig
    let finalFormConfig = existing.formConfig as any || {};
    if (updateData.formConfig) {
      finalFormConfig = { ...finalFormConfig, ...updateData.formConfig };
    }

    return this.prisma.company.update({
      where: { id: existing.id },
      data: {
        ...updateData,
        formConfig: finalFormConfig
      },
    });
  }
}

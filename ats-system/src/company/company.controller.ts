import { Controller, Get, Patch, Body } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  getDetails() {
    return this.companyService.getDetails();
  }

  @Patch()
  update(@Body() updateData: any) {
    return this.companyService.update(updateData);
  }
}

import { Controller, Post, Body, Get, Param, ParseIntPipe, Req, Patch, Delete } from '@nestjs/common';
import { SlotsService } from './slots.service';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post('create-drive')
  async createDrive(@Body() body: { driveData: any; slots: any[] }) {
    return this.slotsService.createDriveWithSlots(body.driveData, body.slots);
  }

  @Get('drives')
  async getDrives() {
    return this.slotsService.findAllDrives();
  }

  @Get('bookings/:driveId')
  async getBookings(@Param('driveId', ParseIntPipe) driveId: number) {
    return this.slotsService.findBookingsByDrive(driveId);
  }

  @Public()
  @Get('public/drive/:id')
  async getPublicDrive(@Param('id', ParseIntPipe) id: number) {
    return this.slotsService.findOneDrive(id);
  }

  @Public()
  @Post('book')
  async bookSlot(@Body() body: { driveId: number; slotId: number; name: string; email: string; mobile: string }) {
    return this.slotsService.bookSlot(body);
  }

  @Public()
  @Get('booking/:idOrToken')
  async getBooking(@Param('idOrToken') idOrToken: string) {
    // If it's a number, use findOneBooking, else findOneBookingByToken
    if (!isNaN(Number(idOrToken))) {
      return this.slotsService.findOneBooking(Number(idOrToken));
    }
    return this.slotsService.findOneBookingByToken(idOrToken);
  }

  @Public()
  @Post('booking/:idOrToken/reschedule')
  async reschedule(@Param('idOrToken') idOrToken: string, @Body() body: { newSlotId: number }) {
    const id = isNaN(Number(idOrToken)) ? idOrToken : Number(idOrToken);
    return this.slotsService.rescheduleBooking(id, body.newSlotId);
  }

  @Public()
  @Post('booking/:idOrToken/cancel')
  async cancel(@Param('idOrToken') idOrToken: string) {
    const id = isNaN(Number(idOrToken)) ? idOrToken : Number(idOrToken);
    return this.slotsService.cancelBooking(id);
  }

  @Public()
  @Post('check-in/verify')
  async verifyCheckIn(@Req() req: Request, @Body() body: { driveId: number; identifier: string }) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.slotsService.verifyCheckIn(body.driveId, body.identifier, ip);
  }

  @Public()
  @Post('check-in/confirm')
  async confirmCheckIn(@Req() req: Request, @Body() body: { bookingId: number; token: string; location?: { lat: number; lng: number } }) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.slotsService.confirmCheckIn(body.bookingId, body.token, ip, body.location);
  }

  @Post('process-no-shows')
  async processNoShows() {
    return this.slotsService.processNoShows();
  }

  @Get('live/:driveId')
  async getLive(@Param('driveId', ParseIntPipe) driveId: number) {
    return this.slotsService.getLiveStats(driveId);
  }

  @Get('analytics/:driveId')
  async getAnalytics(@Param('driveId', ParseIntPipe) driveId: number) {
    return this.slotsService.getAnalytics(driveId);
  }

  @Post('send-booking-email')
  async sendBookingEmail(@Body() body: { candidateId: number; driveId: number; userId?: number }) {
    return this.slotsService.sendBookingEmail(body.candidateId, body.driveId, body.userId);
  }

  @Get('slot/:id/bookings')
  async getSlotBookings(@Param('id', ParseIntPipe) id: number) {
    return this.slotsService.findBookingsBySlot(id);
  }

  @Patch('slot/:id/capacity')
  @Roles('ADMIN')
  async updateSlotCapacity(@Param('id', ParseIntPipe) id: number, @Body() body: { capacity: number }) {
    return this.slotsService.updateSlotCapacity(id, body.capacity);
  }

  @Delete('drive/:id')
  @Roles('ADMIN')
  async removeDrive(@Param('id', ParseIntPipe) id: number) {
    return this.slotsService.removeDrive(id);
  }
}

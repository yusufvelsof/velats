import { Controller, Get, Patch, Post, Body, Request, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async listUsers() {
    const users = await this.usersService.findAll();
    return users.map(({ password, ...user }) => user);
  }

  @Post()
  async createUser(@Body() userData: any) {
    const { password, ...data } = userData;
    const hashedPassword = await bcrypt.hash(password || 'velocity123', 10);
    return this.usersService.create({
      ...data,
      password: hashedPassword,
    });
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    try {
      const { id, password, role, ...data } = updateData;
      const userId = Number(req.user.userId);
      console.log(`[UsersController] Updating profile for user ${userId}`, data);
      return await this.usersService.update(userId, data);
    } catch (error) {
      console.error('[UsersController] Update Profile Error:', error);
      throw error;
    }
  }
}

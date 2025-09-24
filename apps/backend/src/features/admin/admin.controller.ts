import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() loginDto: AdminLoginDto) {
    return await this.adminService.login(loginDto.email, loginDto.password);
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  async getStats(@Request() req: any) {
    return await this.adminService.getUsageStatistics();
  }

  @Get('logs')
  @UseGuards(AdminGuard)
  async getLogs(@Request() req: any) {
    return await this.adminService.getRequestLogs();
  }

  // Admin users management
  @Get('users')
  @UseGuards(AdminGuard)
  async listUsers(@Query('skip') skip = '0', @Query('take') take = '50') {
    return await this.adminService.listUsers(Number(skip) || 0, Number(take) || 50);
  }

  @Get('users/:id')
  @UseGuards(AdminGuard)
  async getUser(@Param('id') id: string) {
    return await this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  @UseGuards(AdminGuard)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return await this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @UseGuards(AdminGuard)
  async deleteUser(@Param('id') id: string) {
    await this.adminService.deleteUser(id);
    return { success: true };
  }
}

import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginDto } from './dto/login.dto';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.adminService.login(loginDto.username, loginDto.password);
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
}

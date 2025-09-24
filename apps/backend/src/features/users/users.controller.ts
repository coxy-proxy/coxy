import { Controller, Get, UseGuards } from '@nestjs/common';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get()
  async me(@UserDecorator() user: any) {
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
}

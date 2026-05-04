import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto';
import { LoginDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService, private readonly usersService: UsersService) {}

  @Post('login')
  @ApiOperation({ summary: 'Simulated login. No JWT; validates email/password and returns session object.' })
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto) { return { success: true, data: this.service.login(dto) }; }

  @Post('register')
  @ApiOperation({ summary: 'Public user registration compatibility endpoint. Creates a user without JWT.' })
  @ApiBody({ type: CreateUserDto })
  register(@Body() dto: CreateUserDto) { return { success: true, data: this.usersService.create(dto) }; }

  @Get('me/:userId')
  @ApiOperation({ summary: 'Get current user profile by user id' })
  me(@Param('userId') userId: string) { return { success: true, data: this.service.me(userId) }; }
}

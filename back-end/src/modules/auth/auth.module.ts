import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({ imports: [StoreModule, UsersModule], controllers: [AuthController], providers: [AuthService] })
export class AuthModule {}

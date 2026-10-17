import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
@Module({imports:[StoreModule],controllers:[UsersController], providers:[UsersService], exports:[UsersService]})
export class UsersModule {}

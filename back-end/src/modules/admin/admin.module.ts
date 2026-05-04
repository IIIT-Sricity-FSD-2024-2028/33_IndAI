import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { AdminController } from './admin.controller';
@Module({imports:[StoreModule], controllers:[AdminController]})
export class AdminModule {}

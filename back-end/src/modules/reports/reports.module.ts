import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { ReportsController } from './reports.controller';
@Module({imports:[StoreModule], controllers:[ReportsController]})
export class ReportsModule {}

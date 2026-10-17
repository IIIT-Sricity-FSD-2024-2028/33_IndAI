import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { EnrollmentsController } from './enrollments.controller';
@Module({imports:[StoreModule], controllers:[EnrollmentsController]})
export class EnrollmentsModule {}

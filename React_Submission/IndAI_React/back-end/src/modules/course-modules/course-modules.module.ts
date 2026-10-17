import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { CourseModulesController } from './course-modules.controller';
@Module({imports:[StoreModule], controllers:[CourseModulesController]})
export class CourseModulesModule {}

import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
@Module({ imports:[StoreModule], controllers:[CoursesController], providers:[CoursesService] })
export class CoursesModule {}

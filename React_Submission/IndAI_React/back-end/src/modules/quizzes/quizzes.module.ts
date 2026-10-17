import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { QuizzesController } from './quizzes.controller';
@Module({imports:[StoreModule], controllers:[QuizzesController]})
export class QuizzesModule {}

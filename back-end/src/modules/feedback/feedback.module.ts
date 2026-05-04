import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { FeedbackController } from './feedback.controller';
@Module({imports:[StoreModule], controllers:[FeedbackController]})
export class FeedbackModule {}

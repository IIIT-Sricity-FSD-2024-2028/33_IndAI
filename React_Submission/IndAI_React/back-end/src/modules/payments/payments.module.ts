import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
@Module({imports:[StoreModule],controllers:[PaymentsController],providers:[PaymentsService],exports:[PaymentsService]})
export class PaymentsModule{}

import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { CommercialController } from './commercial.controller';
import { CommercialService } from './commercial.service';
@Module({imports:[StoreModule],controllers:[CommercialController],providers:[CommercialService],exports:[CommercialService]})
export class CommercialModule{}

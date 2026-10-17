import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { DiagnosticController } from './diagnostic.controller';
@Module({imports:[StoreModule], controllers:[DiagnosticController]})
export class DiagnosticModule {}

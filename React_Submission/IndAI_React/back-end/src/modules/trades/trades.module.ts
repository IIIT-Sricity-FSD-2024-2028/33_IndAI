import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { TradesController, TradingAliasController } from './trades.controller';
import { TradesService } from './trades.service';
@Module({imports:[StoreModule], controllers:[TradesController, TradingAliasController], providers:[TradesService]})
export class TradesModule {}

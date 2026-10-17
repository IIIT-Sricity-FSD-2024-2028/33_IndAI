import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { StocksController, MarketAliasController } from './stocks.controller';
import { StocksService } from './stocks.service';
@Module({imports:[StoreModule], controllers:[StocksController, MarketAliasController], providers:[StocksService]})
export class StocksModule {}

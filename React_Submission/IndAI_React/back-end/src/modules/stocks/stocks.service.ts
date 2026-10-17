import { Injectable, Logger } from '@nestjs/common';
import { DataStore } from '../../store/data.store';

@Injectable()
export class StocksService {
  private logger = new Logger('StocksService');
  constructor(private db: DataStore) {}

  findAll(q?:string, sector?:string, cap?:string) {
    let rows = this.db.getLiveStocks();
    if(q) rows = rows.filter(s=>s.symbol.toLowerCase().includes(q.toLowerCase())||s.name.toLowerCase().includes(q.toLowerCase()));
    if(sector && sector!=='All') rows = rows.filter(s=>s.sector===sector);
    if(cap && cap!=='All') rows = rows.filter(s=>s.cap===cap);
    this.logger.log(`LIVE MARKET LIST -> ${rows.length} stocks from 1-minute CSV replay`);
    return rows;
  }

  findOne(symbol:string){
    const stock = this.db.getLiveStock(symbol);
    this.logger.log(`LIVE QUOTE ${stock.symbol} -> ₹${stock.price} (${stock.change}%) candle#${stock.replayIndex}`);
    return stock;
  }

  candles(symbol:string, limit=240){
    const rows=this.db.getLiveCandles(symbol, limit);
    this.logger.log(`LIVE CANDLES ${symbol.toUpperCase()} -> ${rows.length} rows ending ${rows[rows.length-1]?.datetime}`);
    return rows;
  }

  tick(symbols?:string){
    const list = symbols ? symbols.split(',').map(s=>s.trim()).filter(Boolean) : undefined;
    const tick = this.db.getMarketTick(list);
    this.logger.log(`LIVE TICK -> ${tick.stocks.length} stocks, replay speed ${tick.replaySpeedMs}ms`);
    return tick;
  }
}

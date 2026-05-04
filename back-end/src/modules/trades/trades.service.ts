import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataStore } from '../../store/data.store';
import { CreateTradeDto } from './dto';
@Injectable()
export class TradesService {
  constructor(private readonly db: DataStore) {}
  findAll(){ return this.db.trades; }
  findByUser(userId:string){ return this.db.trades.filter(t=>t.learnerId===userId); }
  execute(dto:CreateTradeDto){
    const user=this.db.getUser(dto.learnerId); if(!user || user.role !== 'learner') throw new NotFoundException('Learner not found.');
    const sym=dto.symbol.toUpperCase();
    const exists=this.db.stocks.some(s=>s.symbol===sym);
    if(!exists) throw new NotFoundException('Stock symbol not found.');
    const stock=this.db.getStock(sym); if(!stock) throw new NotFoundException('Stock not found.');
    const qty=Number(dto.qty); const price=Number(dto.price || stock.price);
    if(!Number.isInteger(qty) || qty <= 0) throw new BadRequestException('Quantity must be a positive whole number.');
    if(!(price > 0)) throw new BadRequestException('Price must be positive.');
    const total=Number((qty*price).toFixed(2));
    const before=this.db.refreshPortfolio(dto.learnerId);
    if(dto.type==='BUY' && (before?.user.virtualBalance||0)<total) throw new BadRequestException(`Insufficient virtual balance. Available ₹${before?.user.virtualBalance}`);
    if(dto.type==='BUY' && total > (user.tradingLimit||100000)) throw new BadRequestException(`Order exceeds trading limit ₹${user.tradingLimit}`);
    if(dto.type==='SELL') { const held=(before?.holdings?.[sym]?.qty)||0; if(held<qty) throw new BadRequestException(`Only ${held} shares available to sell.`); }
    const trade={id:this.db.id('t'), learnerId:dto.learnerId, symbol:sym, type:dto.type, qty, price, total, date:new Date().toISOString(), status:'executed'};
    this.db.trades.push(trade); const portfolio=this.db.refreshPortfolio(dto.learnerId);
    this.db.notifications.push({id:this.db.id('n'), userId:dto.learnerId, message:`${dto.type} ${qty} ${sym} executed at ₹${price}`, type:'trade', read:false, createdAt:new Date().toISOString()});
    return {trade, portfolio};
  }
}

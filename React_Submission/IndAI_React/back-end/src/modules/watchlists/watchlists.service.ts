import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataStore } from '../../store/data.store';
@Injectable()
export class WatchlistsService { constructor(private readonly db:DataStore){}
 list(userId:string){ const user=this.db.getUser(userId); if(!user) throw new NotFoundException('User not found.'); let rows=this.db.watchlists.filter(w=>w.userId===userId); if(!rows.length){ rows=[{id:this.db.id('wl'),userId,name:'My Watchlist',active:true,symbols:['TCS','RELIANCE','INFY']}]; this.db.watchlists.push(...rows);} return rows; }
 create(userId:string,b:any){ const user=this.db.getUser(userId); if(!user) throw new NotFoundException('User not found.'); const symbols=(b.symbols||[]).map((s:string)=>s.toUpperCase()); symbols.forEach((s:string)=>this.assertStock(s)); const w={id:this.db.id('wl'),userId,name:b.name||'New Watchlist',active:false,symbols:[...new Set(symbols)]}; this.db.watchlists.push(w); return w; }
 update(id:string,b:any){ const w=this.db.watchlists.find(x=>x.id===id); if(!w) throw new NotFoundException('Watchlist not found.'); if(b.symbols){ b.symbols=b.symbols.map((s:string)=>s.toUpperCase()); b.symbols.forEach((s:string)=>this.assertStock(s)); b.symbols=[...new Set(b.symbols)]; } Object.assign(w,b); return w; }
 addSymbol(id:string,symbol:string){ const w=this.db.watchlists.find(x=>x.id===id); if(!w) throw new NotFoundException('Watchlist not found.'); const sym=String(symbol||'').toUpperCase(); if(!sym) throw new BadRequestException('Symbol is required.'); this.assertStock(sym); if((w.symbols||[]).includes(sym)) throw new ConflictException('Symbol already exists in watchlist.'); w.symbols=[...(w.symbols||[]), sym]; return w; }
 removeSymbol(id:string,symbol:string){ const w=this.db.watchlists.find(x=>x.id===id); if(!w) throw new NotFoundException('Watchlist not found.'); w.symbols=(w.symbols||[]).filter(s=>s!==String(symbol||'').toUpperCase()); return w; }
 remove(id:string){ const idx=this.db.watchlists.findIndex(w=>w.id===id); if(idx===-1) throw new NotFoundException('Watchlist not found.'); this.db.watchlists.splice(idx,1); return {id}; }
 private assertStock(symbol:string){ const stock=this.db.stocks.find(s=>s.symbol===symbol) || this.db.getStock(symbol); if(!stock) throw new NotFoundException('Stock symbol not found.'); }
}

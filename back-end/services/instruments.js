import { readFileSync } from 'node:fs';

export const symbolPattern=/^[A-Z0-9][A-Z0-9&.-]{0,39}$/;
export const catalogue=JSON.parse(readFileSync(new URL('../assets/catalog/nse-equities.json',import.meta.url),'utf8'));
// Preserve the original eight demo anchors; other anchors are deterministic simulations, never live prices.
const anchors={RELIANCE:143500,TCS:346000,INFY:156000,HDFCBANK:187900,SBIN:79500,ITC:41700,BHARTIARTL:178300,AXISBANK:110700};
export function symbolHash(symbol){let hash=0;for(const char of symbol)hash=(Math.imul(hash,31)+char.charCodeAt(0))>>>0;return hash;}
export function parseCatalogue(body){
  if(!Array.isArray(body))throw Error('Instrument master must be a JSON array.');
  const rows=body.filter(row=>row.segment==='NSE_EQ'&&row.instrument_type==='EQ');
  const seen=new Set();
  return rows.map(row=>{
    if(!symbolPattern.test(row.trading_symbol)||typeof row.name!=='string'||!row.name.trim()||
      !/^IN[A-Z0-9]{10}$/.test(row.isin)||row.instrument_key!=='NSE_EQ|'+row.isin||row.lot_size!==1||seen.has(row.trading_symbol)){
      throw Error('Unsupported or duplicate instrument in NSE equity master. Existing catalogue was retained.');
    }
    seen.add(row.trading_symbol);
    return {trading_symbol:row.trading_symbol,name:row.name,isin:row.isin,instrument_key:row.instrument_key,lot_size:row.lot_size};
  }).sort((a,b)=>a.trading_symbol<b.trading_symbol?-1:a.trading_symbol>b.trading_symbol?1:0);
}
export function installInstruments(db,master=catalogue){
  if(!Array.isArray(master.instruments)||master.instruments.length===0)throw Error('NSE catalogue is empty.');
  db.tx(()=>{
    for(const row of master.instruments){
      const base=anchors[row.trading_symbol]??(1000+symbolHash(row.trading_symbol)%399001);
      db.run(`INSERT INTO instruments(symbol,name,provider_key,base) VALUES (?,?,?,?)
        ON CONFLICT(symbol) DO UPDATE SET name=excluded.name,provider_key=excluded.provider_key`,row.trading_symbol,row.name,row.instrument_key,base);
    }
  });
}

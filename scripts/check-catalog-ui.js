import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';
import {createAppStore} from '../frontend/src/redux/store.js';
import {setWatchlists} from '../frontend/src/redux/slices/watchlistSlice.js';
import {catalogue} from '../back-end/services/instruments.js';
const server=await createServer({configFile:fileURLToPath(new URL('../frontend/vite.config.js',import.meta.url)),server:{middlewareMode:true},optimizeDeps:{noDiscovery:true,include:[]}});
try{
 const {InstrumentPicker}=await server.ssrLoadModule('/src/components/InstrumentPicker.jsx');
 const instruments=catalogue.instruments.map(row=>({symbol:row.trading_symbol,name:row.name,exchange:'NSE'}));
 const html=renderToStaticMarkup(createElement(InstrumentPicker,{catalog:{data:{instruments},isPending:false,isError:false},selected:'RELIANCE',onSelect:()=>{}}));
 assert.equal((html.match(/aria-pressed=/g)||[]).length,40);
 assert(html.includes('Search NSE stocks'));assert(html.includes(instruments.length.toLocaleString('en-IN')+' NSE equity instruments'));assert(html.includes('Next'));
 const empty=renderToStaticMarkup(createElement(InstrumentPicker,{catalog:{data:{instruments:[]},isPending:false,isError:false},selected:'',onSelect:()=>{}}));
 assert(empty.includes('No matching stocks.'));
 const {TradingSidebar}=await server.ssrLoadModule('/src/components/TradingSidebar.jsx');
 const {WatchlistRow}=await server.ssrLoadModule('/src/components/WatchlistRow.jsx');
 const store=createAppStore();store.dispatch(setWatchlists({path:'/trading/watchlists',data:[{id:1,name:'Long term investing and company research',symbols:['M&M','RELIANCE']},{id:2,name:'Short term ideas',symbols:['INFY']}]}));
 const sidebar=renderToStaticMarkup(createElement(Provider,{store},createElement(TradingSidebar,{catalog:{data:{instruments},isPending:false,isError:false},selected:'RELIANCE',onSelect:()=>{}})));
 for(const label of ['Market explorer','Search stocks','Watchlists','New list','Active watchlist','Rename','Reorder','Delete list','Add to list'])assert(sidebar.includes(label)||label==='Add to list'&&sidebar.includes('Added'));
 const row=renderToStaticMarkup(createElement(WatchlistRow,{symbol:'M&M',name:'MAHINDRA & MAHINDRA LIMITED — a full company name',quote:{price:123450,status:'replay',mode:'replay',replayDay:'2026-11-23'},selected:'M&M',editing:true,index:0,total:2,busy:false,onSelect:()=>{},onMove:()=>{},onRemove:()=>{}}));
 assert(row.includes('full company name'));assert(row.includes('Move M&amp;M down'));assert(row.includes('Remove M&amp;M'));assert(row.includes('Replay'));
 console.log('PASS explorer tabs, multiple watchlists, list actions, full company labels and reorder controls render.');
 console.log('PASS catalogue picker renders 40 results from '+instruments.length+' instruments, pagination and empty state. Browser interaction remains a separate check.');
}finally{await server.close();}

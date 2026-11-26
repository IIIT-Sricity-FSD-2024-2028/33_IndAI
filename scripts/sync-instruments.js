import { gunzipSync } from 'node:zlib';
import { writeFileSync,renameSync,unlinkSync,existsSync } from 'node:fs';
import { parseCatalogue,installInstruments } from '../back-end/services/instruments.js';
import { openDatabase } from '../back-end/db.js';
const source='https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz';
const target=new URL('../back-end/assets/catalog/nse-equities.json',import.meta.url);
const temporary=new URL('../back-end/assets/catalog/nse-equities.json.tmp',import.meta.url);
try{
 const response=await fetch(source,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('NSE instrument download failed: HTTP '+response.status);
 const compressed=Buffer.from(await response.arrayBuffer());
 if(compressed.length>25*1024*1024)throw Error('Instrument download exceeds the expected size.');
 const body=JSON.parse(gunzipSync(compressed,{maxOutputLength:100*1024*1024}).toString('utf8'));
 const instruments=parseCatalogue(body);
 if(instruments.length<1000)throw Error('Incomplete NSE catalogue. Existing catalogue was retained.');
 const master={source,retrievedAt:new Date().toISOString(),segment:'NSE_EQ',instrumentType:'EQ',instruments};
 writeFileSync(temporary,JSON.stringify(master)+'\n');
 const db=openDatabase();
 try{installInstruments(db,master);}finally{db.close();}
 renameSync(temporary,target);
 console.log('Updated '+instruments.length+' NSE equity instruments. Restart IndAI to load the updated catalogue metadata.');
}catch(error){if(existsSync(temporary))unlinkSync(temporary);console.error(error.message);process.exitCode=1;}

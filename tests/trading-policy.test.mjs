import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {withUser,createOrder,settleOrder,reset,markPortfolio} from '../back-end/algo/store.mjs';
test('Manual stock orders enforce configured value, daily limit and cooldown',()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'indai-policy-'));
 process.env.DATA_DIR=directory;
 try{withUser('policy-regression',()=>{
  reset();
  const spec={key:'DEMO|RELIANCE',symbol:'RELIANCE',exchange:'DEMO',side:'BUY',type:'MARKET',qty:2};
  const order=createOrder({...spec,policy:{tradingLimit:100}});
  assert.equal(settleOrder(order.id,{last_price:100,source:'SYNTHETIC'}).status,'REJECTED');
  assert.equal(markPortfolio().cash,markPortfolio().startingCash);
  reset();createOrder({...spec,policy:{maxDailyTrades:1}});
  assert.throws(()=>createOrder({...spec,policy:{maxDailyTrades:1}}),/Daily order limit/);
  reset();createOrder(spec);
  assert.throws(()=>createOrder({...spec,policy:{cooldown:60}}),/cooldown/);
 });}finally{fs.rmSync(directory,{recursive:true,force:true});}
});

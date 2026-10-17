import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {withUser,reset,markPortfolio,createOrder,settleOrder,initDB} from '../back-end/algo/store.mjs';
test('Equity snapshots follow price changes with unchanged cash and retain historical marked values',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'indai-valuations-'));process.env.DATA_DIR=dir;
 try{withUser('valuation-test',()=>{
  reset();const baseline=markPortfolio();
  const order=createOrder({key:'DEMO|RELIANCE',symbol:'RELIANCE',exchange:'DEMO',side:'BUY',type:'MARKET',qty:2});settleOrder(order.id,{last_price:100,source:'TEST'});
  const first=markPortfolio({'DEMO|RELIANCE':{last_price:100}});
  const second=markPortfolio({'DEMO|RELIANCE':{last_price:150}});
  assert.equal(first.cash,second.cash);assert.equal(Math.round((second.netWorth-first.netWorth)*100),10000);
  assert.equal(second.equityHistory.at(-1).netWorth,second.netWorth);assert.equal(second.equityHistory.at(-1).holdings,300);
  assert.equal(second.equityHistory[0].netWorth,baseline.netWorth);assert.ok(second.equityHistory.some(p=>p.netWorth===first.netWorth));
  initDB();const restored=markPortfolio({'DEMO|RELIANCE':{last_price:150}});assert.equal(restored.equityHistory.at(-1).netWorth,second.netWorth);
 });}finally{fs.rmSync(dir,{recursive:true,force:true});}
});

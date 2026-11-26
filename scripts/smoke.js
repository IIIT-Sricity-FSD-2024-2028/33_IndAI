import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../',import.meta.url);
const directory = await mkdtemp(join(tmpdir(),'indai-smoke-'));
const env = {...process.env,NODE_ENV:'development',DEMO_MODE:'true',MARKET_SOURCE:'demo',PORT:'3330',PUBLIC_URL:'http://localhost:5330',DATA_DIR:directory};
async function waitFor(url) {
  for(let i=0;i<40;i++) {
    try {
      const response = await fetch(url);
      if(response.ok) return response;
    } catch {}
    await pause(200);
  }
  throw Error('Timed out: '+url);
}
async function withProcess(command,cwd,check) {
  const child=spawn(process.execPath,command,{cwd,env,stdio:'inherit'});
  try { await check(); }
  finally {
    if(child.exitCode===null) {
      child.kill();
      await once(child,'exit');
    }
  }
}
try {
  await withProcess(['scripts/dev.js'],root,async()=>{
    assert.match(await (await waitFor(env.PUBLIC_URL+'/login')).text(),/src\/main\.jsx/);
    const ready=await (await waitFor(env.PUBLIC_URL+'/api/ready')).json();
    assert.equal(ready.status,'ready');
    console.log('PASS dev serves the React source and proxies browser API calls.');
  });
  await withProcess([fileURLToPath(new URL('back-end/server.js',root)),'--serve'],tmpdir(),async()=>{
    await waitFor('http://localhost:3330/api/ready');
    assert.match(await (await fetch('http://localhost:3330/trading')).text(),/assets\/.*\.js/);
    const unknown=await fetch('http://localhost:3330/api/does-not-exist');
    assert.equal(unknown.status,404);
    assert.equal((await unknown.json()).code,'NOT_FOUND');
    console.log('PASS built server starts from another directory, refreshes SPA routes, and handles API 404s.');
  });
} finally {
  await rm(directory,{recursive:true,force:true});
}

import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../',import.meta.url));
const directory=await mkdtemp(join(tmpdir(),'indai-trading-ui-'));const base='http://localhost:3344';
const env={...process.env,NODE_ENV:'development',DEMO_MODE:'true',MARKET_SOURCE:process.env.TEST_MARKET_SOURCE||'demo',PORT:'3344',PUBLIC_URL:base,DATA_DIR:directory};
const screenshots=process.env.UI_SCREENSHOTS;
let server,browser,page;const errors=[];
try{
 const setup=spawnSync(process.execPath,['scripts/setup.js'],{cwd:root,env,encoding:'utf8'});assert.equal(setup.status,0,setup.stderr);
 server=spawn(process.execPath,['back-end/server.js','--serve'],{cwd:root,env,stdio:'inherit'});
 for(let i=0;i<50;i++){try{if((await fetch(base+'/api/ready')).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,150));}
 browser=await chromium.launch({headless:true,args:process.env.PLAYWRIGHT_SINGLE_PROCESS==='true'?['--single-process','--no-zygote','--in-process-gpu']:[]});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});page=await context.newPage();page.setDefaultTimeout(15000);
 page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
 await page.goto(base+'/login');await page.getByRole('button',{name:'Quick login as Instructor',exact:true}).click();
 await page.getByRole('heading',{name:/Welcome/}).waitFor();await page.goto(base+'/trading');
 await page.getByRole('heading',{name:'RELIANCE',exact:true}).waitFor();
 if(process.env.TEST_MARKET_SOURCE==='upstox')await page.getByText('Market closed · historical replay',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Stocks & watchlists',exact:true}).click();
 const sidebar=page.getByRole('complementary',{name:'Stocks and watchlists'});
 assert((await sidebar.boundingBox()).width>=300);
 await sidebar.getByRole('tab',{name:'Watchlists',exact:true}).click();
 await sidebar.getByRole('button',{name:'New list',exact:true}).click();await sidebar.getByLabel('Watchlist name',{exact:true}).fill('My research and long term investing');
 await sidebar.getByRole('button',{name:'Create watchlist',exact:true}).click();await sidebar.getByRole('heading',{name:'My research and long term investing',exact:true}).waitFor();
 await sidebar.getByRole('button',{name:'Add to list',exact:true}).click();await sidebar.locator('.watch-ticker').filter({hasText:'RELIANCE'}).waitFor();
 const researchId=await sidebar.getByLabel('Active watchlist').inputValue();
 await sidebar.getByRole('button',{name:'Find another stock',exact:true}).click();await sidebar.getByLabel('Search NSE stocks').fill('M&M');
 await sidebar.locator('.symbol-results button').filter({hasText:'M&M'}).first().click();await page.waitForURL(/symbol=M%26M/);
 await sidebar.getByRole('button',{name:'Save to a watchlist',exact:true}).click();await sidebar.getByRole('button',{name:'Add to list',exact:true}).click();await sidebar.locator('.watch-ticker').filter({hasText:'M&M'}).waitFor();
 await sidebar.getByRole('button',{name:'Reorder',exact:true}).click();await sidebar.getByRole('button',{name:'Move M&M up',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.watch-ticker')?.textContent==='M&M');
 await sidebar.getByRole('button',{name:'Move M&M down',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.watch-ticker')?.textContent==='RELIANCE');
 await sidebar.getByRole('button',{name:'Done reordering',exact:true}).click();
 await sidebar.getByRole('button',{name:'Rename',exact:true}).click();await sidebar.getByLabel('New watchlist name',{exact:true}).fill('Research companies for long-term investing');await sidebar.getByRole('button',{name:'Save name',exact:true}).click();await sidebar.getByRole('heading',{name:'Research companies for long-term investing',exact:true}).waitFor();
 await sidebar.getByRole('button',{name:'New list',exact:true}).click();await sidebar.getByLabel('Watchlist name',{exact:true}).fill('Temporary ideas');await sidebar.getByRole('button',{name:'Create watchlist',exact:true}).click();await sidebar.getByRole('heading',{name:'Temporary ideas',exact:true}).waitFor();
 await sidebar.getByRole('button',{name:'Delete list',exact:true}).click();await sidebar.getByRole('button',{name:'Confirm delete',exact:true}).click();await sidebar.getByRole('status').filter({hasText:'Watchlist deleted.'}).waitFor();
 await sidebar.getByLabel('Active watchlist').selectOption(researchId);await sidebar.getByRole('heading',{name:'Research companies for long-term investing',exact:true}).waitFor();
 assert.equal(await sidebar.locator('.watch-entry').count(),2);
 assert(await sidebar.locator('.watch-company').evaluateAll(nodes=>nodes.every(n=>n.scrollWidth<=n.clientWidth+1&&n.scrollHeight<=n.clientHeight+1)));
 if(screenshots){await mkdir(screenshots,{recursive:true});await page.screenshot({path:join(screenshots,'desktop-watchlists.png'),fullPage:true});}
 await page.getByRole('button',{name:'Back to chart',exact:true}).click();
 const chart=page.getByRole('region',{name:'Chart workspace'});
 assert((await chart.boundingBox()).width>680);
 await page.getByRole('button',{name:'Line chart',exact:true}).click();await page.getByLabel('Line price chart').waitFor();
 await page.getByRole('button',{name:'Candlesticks',exact:true}).click();await page.getByLabel('Candlestick chart').waitFor();
 await page.getByRole('button',{name:'Reset chart view',exact:true}).click();
 await page.getByRole('button',{name:'Expand chart',exact:true}).click();
 await page.waitForFunction(()=>document.fullscreenElement!==null);
 await page.getByRole('button',{name:'Exit full-screen chart',exact:true}).click();await page.waitForFunction(()=>document.fullscreenElement===null);
 if(screenshots)await page.screenshot({path:join(screenshots,'desktop-terminal.png'),fullPage:true});
 await page.getByRole('button',{name:'Stocks & watchlists',exact:true}).click();
 await sidebar.getByRole('button',{name:'Remove M&M',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.watch-entry').length===1);
 await page.reload();await page.getByRole('heading',{name:'M&M',exact:true}).waitFor();await page.getByRole('button',{name:'Stocks & watchlists',exact:true}).click();await sidebar.getByRole('tab',{name:'Watchlists',exact:true}).click();await sidebar.getByLabel('Active watchlist').selectOption(researchId);
 assert.equal(await sidebar.locator('.watch-ticker').first().innerText(),'RELIANCE');
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});await page.waitForFunction(()=>document.documentElement.scrollWidth<=window.innerWidth);
  assert(await sidebar.locator('.watch-company').evaluateAll(nodes=>nodes.every(n=>n.scrollWidth<=n.clientWidth+1&&n.scrollHeight<=n.clientHeight+1)));
  if(width===390){await page.getByRole('button',{name:'Back to chart',exact:true}).click();await page.getByRole('button',{name:'Switch to dark mode'}).click();await page.getByRole('button',{name:'Stocks & watchlists',exact:true}).click();if(screenshots)await page.screenshot({path:join(screenshots,'mobile-dark-watchlists.png'),fullPage:true});}
  await sidebar.getByRole('tab',{name:'Search stocks',exact:true}).click();await sidebar.getByLabel('Search NSE stocks').fill('MAHINDRA');await sidebar.locator('.symbol-results button').first().waitFor();
  assert(await sidebar.locator('.symbol-results small').evaluateAll(nodes=>nodes.every(n=>n.scrollHeight<=n.clientHeight+1)));
  if(width===320&&screenshots)await page.screenshot({path:join(screenshots,'small-screen-search.png'),fullPage:true});
  await sidebar.getByRole('tab',{name:'Watchlists',exact:true}).click();
  await page.getByRole('button',{name:'Back to chart',exact:true}).click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  if(screenshots)await page.screenshot({path:join(screenshots,'terminal-'+width+'.png'),fullPage:true});
  await page.getByRole('button',{name:'Stocks & watchlists',exact:true}).click();
 }
 assert.deepEqual(errors,[]);console.log('PASS browser: wide terminal, chart styles/reset/fullscreen, explorer drawer, all watchlist operations, persisted lists, readable labels, 1440/390/320px layouts, dark mode and no JavaScript errors.');
}catch(error){console.error('Browser errors:',errors);if(page){console.error('Page:',page.url(),(await page.locator('body').innerText().catch(()=>'' )).slice(0,1400));if(screenshots){await mkdir(screenshots,{recursive:true});await page.screenshot({path:join(screenshots,'failure.png'),fullPage:true}).catch(()=>{});}}throw error;}finally{
 await browser?.close();if(server?.exitCode===null){server.kill();await once(server,'exit');}await rm(directory,{recursive:true,force:true});
}

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
if(Number(process.versions.node.split('.')[0])!==24) throw Error('Use Node 24 for this application.');
if(!process.env.npm_execpath) throw Error('Run npm run setup from the repository root.');
const install=spawnSync(process.execPath,[process.env.npm_execpath,'ci'],{cwd:root,stdio:'inherit'});
if(install.status!==0)process.exit(install.status||1);
await import('./setup.js');

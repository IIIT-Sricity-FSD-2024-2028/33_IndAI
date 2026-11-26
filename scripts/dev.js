import { spawn } from 'node:child_process';
import { config,root } from '../back-end/config.js';
console.log('Frontend: ' + config.publicUrl + ' | API: http://localhost:' + config.port);
const processes = [
  spawn(process.execPath,['--watch','back-end/server.js'],{cwd:root,stdio:'inherit'}),
  spawn(process.execPath,['node_modules/vite/bin/vite.js','--config','frontend/vite.config.js'],{cwd:root,stdio:'inherit'})
];
let stopping=false;
function stop(code=0) {
  if (stopping) return;
  stopping=true;
  process.exitCode=code;
  processes.forEach(child=>child.kill());
}
processes.forEach(child=>child.on('exit',code=>stop(code ?? 0)));
process.on('SIGINT',()=>stop());
process.on('SIGTERM',()=>stop());

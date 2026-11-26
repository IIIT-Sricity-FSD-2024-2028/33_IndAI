import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const records=JSON.parse(fs.readFileSync(path.join(root,'docs/team-responsibilities.json'),'utf8'));
assert.equal(records.length,5);
assert.equal(new Set(records.map(r=>r.username)).size,5);
assert.equal(new Set(records.map(r=>r.authorEmail)).size,5);
const history=spawnSync('git',['rev-parse','--is-inside-work-tree'],{cwd:root,encoding:'utf8'}).status===0;
let checked=0;
for(const record of records){
 for(const relative of record.paths){
  const resolved=path.resolve(root,relative);
  assert.ok(resolved.startsWith(root),relative);
  assert.ok(fs.statSync(resolved).isFile(),relative);checked++;
 }
 for(const anchor of record.anchors){assert.ok(fs.readFileSync(path.join(root,anchor.path),'utf8').includes(anchor.contains),record.username+': '+anchor.path);checked++;}
 if(history)for(const commit of [record.backendImportCommit,record.frontendImportCommit]){
  assert.match(commit,/^[a-f0-9]{40}$/);
  const author=spawnSync('git',['show','-s','--format=%ae',commit],{cwd:root,encoding:'utf8'});
  assert.equal(author.status,0,author.stderr);assert.equal(author.stdout.trim(),record.authorEmail);
 }
}
console.log(`PASS ${records.length} member records; ${checked} source paths/anchors; ${history?'Git author emails verified':'Git history unavailable: commit attribution not checked'}.`);
console.log('Structural checks do not prove original authorship or application correctness.');

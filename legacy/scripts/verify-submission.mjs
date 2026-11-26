import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const records=JSON.parse(fs.readFileSync(path.join(root,'submission/responsibilities.json'),'utf8'));
let checked=0;
for(const record of records){
  for(const file of record.paths){assert.ok(fs.statSync(path.join(root,file)).isFile(),file);checked++;}
  for(const a of record.anchors){assert.ok(fs.readFileSync(path.join(root,a.path),'utf8').includes(a.contains),`${record.member}: missing ${a.contains} in ${a.path}`);checked++;}
}
// Validate documented application source paths as well as the explicit responsibility manifest.
for(const file of ['README.md','INDIVIDUAL_CONTRIBUTION.md','EVALUATION_GUIDE.md','GIT_SUBMISSION.md',...fs.readdirSync(path.join(root,'submission')).filter(x=>x.endsWith('.md')).map(x=>'submission/'+x),...fs.readdirSync(path.join(root,'submission/viva')).map(x=>'submission/viva/'+x)]){
 const text=fs.readFileSync(path.join(root,file),'utf8');
 for(const match of text.matchAll(/`((?:frontend|back-end|scripts|tests)\/[^`\n]+\.(?:jsx|js|ts|mjs|cjs|webm))`/g)){
   assert.ok(fs.existsSync(path.join(root,match[1])),`${file}: nonexistent ${match[1]}`);checked++;
 }
}
console.log(`PASS ${records.length} member records; ${checked} source path/symbol references validated. This does not prove authorship or semantic correctness; source review is also required.`);

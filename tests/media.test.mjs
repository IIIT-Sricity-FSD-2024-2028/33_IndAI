import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {signMediaUrl,validMediaUrl}=require('../back-end/dist/common/media.util.js');
test('Local media links require a valid unmodified expiring signature',()=>{
 const link=signMediaUrl('/uploads/videos/example.webm');
 assert.equal(validMediaUrl(link),true);
 assert.equal(validMediaUrl('/uploads/videos/example.webm'),false);
 assert.equal(validMediaUrl(link.replace('example.webm','another.webm')),false);
 const altered=new URL(link,'http://localhost');altered.searchParams.set('expires','1');
 assert.equal(validMediaUrl(altered.pathname+altered.search),false);
 assert.equal(signMediaUrl('https://example.com/material.pdf'),'https://example.com/material.pdf');
});

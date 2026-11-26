import { copyFileSync,existsSync } from 'node:fs';
const example = new URL('../.env.example',import.meta.url);
const file = new URL('../.env',import.meta.url);
if (!existsSync(file)) copyFileSync(example,file);
const { config } = await import('../back-end/config.js');
const { openDatabase } = await import('../back-end/db.js');
const { bootstrap,installInstruments,seed } = await import('../back-end/seed.js');
const db = openDatabase();
try {
  installInstruments(db);
  bootstrap(db);
  if (config.demo || process.argv.includes('--seed')) {
    await seed(db);
    console.log('Demo database ready. Sign in as student1@indai.test with IndAI-Demo-2026.');
  } else console.log('Database migrations applied.');
} finally { db.close(); }

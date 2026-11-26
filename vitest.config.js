import {defineConfig} from 'vitest/config';
export default defineConfig({test:{env:{MARKET_SOURCE:'demo',DEMO_MODE:'true'},include:['tests/**/*.test.js']}});

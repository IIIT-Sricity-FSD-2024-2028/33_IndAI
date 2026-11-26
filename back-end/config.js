import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
const envFile = resolve(root, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);
const env = process.env;
const production = env.NODE_ENV === 'production';
const demo = env.DEMO_MODE ? env.DEMO_MODE === 'true' : !production;
export const config = {
  production, demo, port: Number(env.PORT || 3000),
  publicUrl: new URL(env.PUBLIC_URL || 'http://localhost:5173').origin,
  directory: resolve(root, env.DATA_DIR || 'data'),
  initialCash: Number(env.INITIAL_PAPER_CASH || 100000) * 100,
  requestDays: Number(env.REQUEST_DAYS || 7),
  prices: { pro: Number(env.PRO_PRICE_PAISE || (demo ? 49900 : 0)), plus: Number(env.PLUS_PRICE_PAISE || (demo ? 99900 : 0)) },
  keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET, webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
  provider: env.MARKET_SOURCE || (demo ? 'demo' : 'upstox'),
  replayClosed:env.MARKET_REPLAY_WHEN_CLOSED!=='false',
  tickMs:Number(env.DEMO_TICK_MS || env.REPLAY_CANDLE_MS || 2000),
  analytics: env.UPSTOX_ANALYTICS_TOKEN,
  marketAccess: env.UPSTOX_ACCESS_TOKEN,
  mail: { host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 587), user: env.SMTP_USER, pass: env.SMTP_PASS, from: env.SMTP_FROM },
  admin: { email: env.BOOTSTRAP_ADMIN_EMAIL, password: env.BOOTSTRAP_ADMIN_PASSWORD, mfa: env.BOOTSTRAP_ADMIN_TOTP_SECRET }
};
if (![config.port, config.initialCash, config.requestDays,config.tickMs, ...Object.values(config.prices)].every(Number.isSafeInteger) ||
    config.tickMs<500 || config.tickMs>60000 || config.port < 1 || config.port > 65535 || config.initialCash <= 0 || config.initialCash > 1e12 || config.requestDays < 1 ||
    Object.values(config.prices).some(price => price < 0 || price > 1e9) || !['demo','upstox'].includes(config.provider)) {
  throw Error('Invalid numeric configuration or MARKET_SOURCE');
}
if (production && (demo || config.provider === 'demo' || !config.publicUrl.startsWith('https://') ||
    !config.mail.host || !config.mail.from)) {
  throw Error('Production requires DEMO_MODE=false, MARKET_SOURCE=upstox, HTTPS PUBLIC_URL and SMTP_HOST/SMTP_FROM');
}

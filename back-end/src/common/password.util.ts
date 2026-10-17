import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;
const PREFIX = 'scrypt';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(String(password), salt, KEY_LENGTH).toString('hex');
  return `${PREFIX}$${salt}$${derived}`;
}

export function isPasswordHash(value?: string): boolean {
  return typeof value === 'string' && value.startsWith(`${PREFIX}$`);
}

export function verifyPassword(password: string, stored?: string): boolean {
  if (!stored || !isPasswordHash(stored)) return false;
  const parts = stored.split('$');
  if (parts.length !== 3) return false;
  const [, salt, expectedHex] = parts;
  try {
    const actual = scryptSync(String(password), salt, KEY_LENGTH);
    const expected = Buffer.from(expectedHex, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

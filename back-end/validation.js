import { z } from 'zod';
import { fail } from './db.js';
export const form = fields => z.object(fields).strict();
export const read = (schema, input) => {
  const result = schema.safeParse(input);
  if (!result.success) fail(422, 'VALIDATION_ERROR', 'Check the highlighted fields.', Object.fromEntries(result.error.issues.map(issue => [issue.path.join('.') || 'form', issue.message])));
  return result.data;
};
export const words = (max, min = 1) => z.string().trim().min(min).max(max);
export const email = z.string().trim().toLowerCase().email().max(254);
export const password = z.string().min(12).max(128);
export const numeric = (min, max) => z.number().int().min(min).max(max);
export const id = z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER);
export const page = input => read(z.coerce.number().int().min(0).max(10000), input ?? 0);
export { z };

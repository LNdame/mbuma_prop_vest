/**
 * Password hashing using Node's built-in crypto.scrypt — no external dependencies.
 */
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [hash, salt] = stored.split('.');
  if (!hash || !salt) return false;
  const buf = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  const storedBuf = Buffer.from(hash, 'hex');
  return buf.length === storedBuf.length && timingSafeEqual(buf, storedBuf);
}

/**
 * Minimal HS256 JWT using Node's built-in crypto — no external dependencies.
 */
import { createHmac, timingSafeEqual } from 'crypto';

const ALG = 'HS256';

function b64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

function decode(s: string): string {
  return Buffer.from(s, 'base64url').toString('utf8');
}

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string, expiresInSec = 60 * 60 * 24): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = { ...payload, iat: now, exp: now + expiresInSec };
  const header = b64url(JSON.stringify({ alg: ALG, typ: 'JWT' }));
  const body   = b64url(JSON.stringify(fullPayload));
  const sig    = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [header, body, sig] = parts;
  const expected = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  // timing-safe compare
  const sigBuf = Buffer.from(sig, 'base64url');
  const expBuf = Buffer.from(expected, 'base64url');
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('Invalid signature');
  }
  const payload: JwtPayload = JSON.parse(decode(body));
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return payload;
}

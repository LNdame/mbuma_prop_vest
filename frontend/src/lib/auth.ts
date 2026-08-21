'use client';

/**
 * Client-side auth-token helpers. These only read the JWT's `exp` claim for UX
 * decisions (e.g. whether to show a logged-in menu) — the backend still performs
 * full signature + expiry verification on every request.
 */

interface JwtClaims {
  exp?: number; // unix seconds
}

/** Decode a JWT payload without verifying its signature. Returns null if malformed. */
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const body = token.split('.')[1];
    if (!body) return null;
    const json = atob(body.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

/** True when the token is present, well-formed, and not past its `exp`. */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const claims = decodeJwt(token);
  if (!claims || typeof claims.exp !== 'number') return false;
  return claims.exp > Math.floor(Date.now() / 1000);
}

/** Remove any stored auth state. */
export function clearAuth(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

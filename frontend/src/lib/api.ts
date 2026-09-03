const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000';

// Service-account token for authenticated SSR calls. Credentials come from env
// (SSR_ADMIN_EMAIL / SSR_ADMIN_PASSWORD), set per environment — e.g. as Railway
// service variables in production. The fallbacks are the local dev-seed admin so
// `npm run dev` keeps working without extra setup.
const SSR_ADMIN_EMAIL = process.env.SSR_ADMIN_EMAIL ?? 'admin@mbuma.co.za';
const SSR_ADMIN_PASSWORD = process.env.SSR_ADMIN_PASSWORD ?? 'Admin1234!';

let _cachedToken: string | null = null;

async function getAdminToken(forceRefresh = false): Promise<string> {
  if (_cachedToken && !forceRefresh) return _cachedToken;
  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SSR_ADMIN_EMAIL, password: SSR_ADMIN_PASSWORD }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`SSR admin login failed (${res.status}) for ${SSR_ADMIN_EMAIL}`);
  const { token } = await res.json();
  _cachedToken = token;
  return token;
}

export async function apiFetch<T>(path: string): Promise<T> {
  // The SSR admin token expires (24h TTL) while the Next.js server process keeps
  // running for days, so a cached token eventually goes stale. On a 401 we drop
  // the cached token, re-login once, and retry before giving up.
  let token = await getAdminToken();
  let res = await fetch(`${BACKEND}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 401) {
    _cachedToken = null;
    token = await getAdminToken(true);
    res = await fetch(`${BACKEND}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${body}`);
  }
  return res.json();
}

/** Unauthenticated fetch for public endpoints (browse properties, public detail). */
export async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${body}`);
  }
  return res.json();
}

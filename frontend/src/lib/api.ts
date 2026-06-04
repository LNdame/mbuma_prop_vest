const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000';

// Admin token for SSR calls — in production this comes from a session cookie/JWT.
// For now we use the hardcoded dev admin credentials to obtain a token at build time.
let _cachedToken: string | null = null;

async function getAdminToken(): Promise<string> {
  if (_cachedToken) return _cachedToken;
  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@mbuma.co.za', password: 'Admin1234!' }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Admin login failed');
  const { token } = await res.json();
  _cachedToken = token;
  return token;
}

export async function apiFetch<T>(path: string): Promise<T> {
  const token = await getAdminToken();
  const res = await fetch(`${BACKEND}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${body}`);
  }
  return res.json();
}

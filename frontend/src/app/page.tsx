import type { ApiResponse, Property } from '@mbuma/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function getProperties(): Promise<Property[]> {
  try {
    const res = await fetch(`${API_URL}/api/properties`, { cache: 'no-store' });
    if (!res.ok) return [];
    const body = (await res.json()) as ApiResponse<Property[]>;
    return body.data;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const properties = await getProperties();

  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>Mbuma Prop Vest</h1>
      <p>{properties.length} properties listed.</p>
      <ul>
        {properties.map((p) => (
          <li key={p.id}>
            {p.title} — {p.address} (${(p.priceCents / 100).toLocaleString()})
          </li>
        ))}
      </ul>
    </main>
  );
}

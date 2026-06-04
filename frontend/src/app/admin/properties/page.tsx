import { apiFetch } from '@/lib/api';
import PropertiesClient, { type Property } from './PropertiesClient';

export default async function PropertiesPage() {
  let properties: Property[] = [];
  try {
    const result = await apiFetch<{ data: Property[] }>('/api/properties');
    properties = result.data;
  } catch (err) {
    console.error('[properties page] apiFetch failed:', err);
    properties = [];
  }
  return <PropertiesClient properties={properties} />;
}

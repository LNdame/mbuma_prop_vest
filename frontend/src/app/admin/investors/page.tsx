import { apiFetch } from '@/lib/api';
import InvestorsClient, { type Investor } from './InvestorsClient';

export default async function InvestorsPage() {
  let investors: Investor[] = [];
  try {
    const result = await apiFetch<{ data: Investor[] }>('/api/investors');
    investors = result.data;
  } catch (err) {
    console.error('[investors page] apiFetch failed:', err);
    investors = [];
  }
  return <InvestorsClient investors={investors} />;
}

import { apiFetch } from '@/lib/api';
import InvestorsClient, { type Investor } from './InvestorsClient';

export default async function InvestorsPage() {
  let investors: Investor[] = [];
  try {
    const result = await apiFetch<{ data: Investor[] }>('/api/investors');
    investors = result.data;
  } catch {
    // Backend unavailable — render empty state rather than crashing
    investors = [];
  }
  return <InvestorsClient investors={investors} />;
}

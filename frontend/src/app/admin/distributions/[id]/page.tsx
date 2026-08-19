import { apiFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
import DistributionDetailClient, { type DistDetail } from './DistributionDetailClient';

export default async function DistributionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let dist: DistDetail;
  try {
    dist = await apiFetch<DistDetail>(`/api/distributions/${id}`);
  } catch {
    notFound();
  }

  return <DistributionDetailClient dist={dist} />;
}

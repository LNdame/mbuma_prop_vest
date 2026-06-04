import { apiFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
import EditPropertyForm, { type PropertyFormData } from './EditPropertyForm';

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let property: PropertyFormData;
  try {
    const res = await apiFetch<{ data: PropertyFormData }>(`/api/properties/${id}`);
    property = res.data;
  } catch {
    notFound();
  }

  return <EditPropertyForm property={property} />;
}

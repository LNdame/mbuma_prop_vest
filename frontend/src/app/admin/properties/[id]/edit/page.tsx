import { apiFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
import EditPropertyForm, { type PropertyFormData, type PropertyImageData } from './EditPropertyForm';

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let property: PropertyFormData;
  try {
    const res = await apiFetch<{ data: PropertyFormData }>(`/api/properties/${id}`);
    property = res.data;
  } catch {
    notFound();
  }

  // Existing property images (signed URLs re-issued by the backend on each read)
  let images: PropertyImageData[] = [];
  try {
    const imgRes = await apiFetch<{ data: PropertyImageData[] }>(`/api/properties/${id}/images`);
    images = imgRes.data;
  } catch {
    images = [];
  }

  return <EditPropertyForm property={property} initialImages={images} />;
}

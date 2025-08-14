import fetchWithToken from '@/utils/apiClient';
import { ProductVariant } from '@/types/models';

function endpoint(id?: number) {
  return id ? `/api/product-variants/${id}` : '/api/product-variants';
}

export async function getProductVariants(): Promise<ProductVariant[]> {
  const res = await fetchWithToken(endpoint());
  if (!res.ok) throw new Error('Failed to fetch variants');
  return res.json();
}

export async function getProductVariant(id: number): Promise<ProductVariant> {
  const res = await fetchWithToken(endpoint(id));
  if (!res.ok) throw new Error('Failed to fetch variant');
  return res.json();
}

export async function createProductVariant(data: {
  name: string;
  productId: number;
}): Promise<ProductVariant> {
  const res = await fetchWithToken(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create variant');
  return res.json();
}

export async function updateProductVariant(
  id: number,
  data: { name?: string }
): Promise<ProductVariant> {
  const res = await fetchWithToken(endpoint(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update variant');
  return res.json();
}

export async function deleteProductVariant(id: number): Promise<void> {
  const res = await fetchWithToken(endpoint(id), { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete variant');
}

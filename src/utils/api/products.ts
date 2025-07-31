import fetchWithToken from '@/utils/apiClient';
import { Product } from '@/types/models';

function endpoint(id?: number) {
  return id ? `/products/${id}` : '/products';
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetchWithToken(endpoint());
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getProduct(id: number): Promise<Product> {
  const res = await fetchWithToken(endpoint(id));
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function createProduct(data: { name: string }): Promise<Product> {
  const res = await fetchWithToken(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function updateProduct(
  id: number,
  data: { name?: string }
): Promise<Product> {
  const res = await fetchWithToken(endpoint(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetchWithToken(endpoint(id), { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete product');
}

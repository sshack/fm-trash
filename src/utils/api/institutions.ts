import fetchWithToken from '@/utils/apiClient';
import { Institution } from '@/types/models';

function endpoint(id?: number) {
  return id ? `/institutions/${id}` : '/institutions';
}

export async function getInstitutions(): Promise<Institution[]> {
  const res = await fetchWithToken(endpoint());
  if (!res.ok) throw new Error('Failed to fetch institutions');
  return res.json();
}

export async function getInstitution(id: number): Promise<Institution> {
  const res = await fetchWithToken(endpoint(id));
  if (!res.ok) throw new Error('Failed to fetch institution');
  return res.json();
}

export async function createInstitution(data: {
  name: string;
  sector: string;
  logo: File | null;
}): Promise<Institution> {
  const body = new FormData();
  body.append('name', data.name);
  body.append('sector', data.sector);
  if (data.logo) body.append('file', data.logo);

  const res = await fetchWithToken(endpoint(), {
    method: 'POST',
    body,
  });
  if (!res.ok) throw new Error('Failed to create institution');
  return res.json();
}

export async function updateInstitution(
  id: number,
  data: { name?: string; sector?: string; logo?: File | null }
): Promise<Institution> {
  const body = new FormData();
  if (data.name) body.append('name', data.name);
  if (data.sector) body.append('sector', data.sector);
  if (data.logo) body.append('file', data.logo);

  const res = await fetchWithToken(endpoint(id), {
    method: 'PATCH',
    body,
  });
  if (!res.ok) throw new Error('Failed to update institution');
  return res.json();
}

export async function deleteInstitution(id: number): Promise<void> {
  const res = await fetchWithToken(endpoint(id), { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete institution');
}

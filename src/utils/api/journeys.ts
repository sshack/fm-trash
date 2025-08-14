import fetchWithToken from '@/utils/apiClient';
import { Journey } from '@/types/models';

function endpoint(id?: number) {
  return id ? `/api/journeys/${id}` : '/api/journeys';
}

export async function getJourneys(): Promise<Journey[]> {
  const res = await fetchWithToken(endpoint());
  if (!res.ok) throw new Error('Failed to fetch journeys');
  return res.json();
}

export async function getJourneysByInstitution(
  institutionId: number
): Promise<Journey[]> {
  const res = await fetchWithToken(
    `/api/journeys?institutionId=${institutionId}`
  );
  if (!res.ok) throw new Error('Failed to fetch journeys');
  return res.json();
}

export async function getJourney(id: number): Promise<Journey> {
  const res = await fetchWithToken(endpoint(id));
  if (!res.ok) throw new Error('Failed to fetch journey');
  return res.json();
}

export async function createJourney(data: {
  name: string;
  segment: 'PF' | 'PJ';
  channel: 'WEB' | 'MOBILE';
  productVariantId: number;
  institutionId: number;
}): Promise<Journey> {
  const res = await fetchWithToken(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create journey');
  return res.json();
}

export async function updateJourney(
  id: number,
  data: {
    name?: string;
    segment?: 'PF' | 'PJ';
    channel?: 'WEB' | 'MOBILE';
    productVariantId?: number;
  }
): Promise<Journey> {
  const res = await fetchWithToken(endpoint(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update journey');
  return res.json();
}

export async function deleteJourney(id: number): Promise<void> {
  const res = await fetchWithToken(endpoint(id), { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete journey');
}

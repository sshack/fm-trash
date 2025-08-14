import fetchWithToken from '@/utils/apiClient';
import { Screenshot } from '@/types/models';

function endpoint(id?: number) {
  return id ? `/api/screenshots/${id}` : '/api/screenshots';
}

export interface ScreenshotPayload {
  journeyId: number;
  file: File;
  name?: string;
  description?: string;
  position?: number;
}

export async function createScreenshot(
  payload: ScreenshotPayload
): Promise<Screenshot> {
  const body = new FormData();
  body.append('file', payload.file);
  body.append('journeyId', String(payload.journeyId));
  if (payload.name) body.append('name', payload.name);
  if (payload.description) body.append('description', payload.description);
  if (payload.position !== undefined)
    body.append('position', String(payload.position));

  const res = await fetchWithToken(endpoint(), {
    method: 'POST',
    body,
  });
  if (!res.ok) throw new Error('Failed to upload screenshot');
  return res.json();
}

export async function createScreenshotsBatch(
  payloads: ScreenshotPayload[]
): Promise<Screenshot[]> {
  const promises = payloads.map((payload) => createScreenshot(payload));
  return Promise.all(promises);
}

export async function updateScreenshot(
  id: number,
  data: {
    name?: string;
    description?: string;
    position?: number;
    type?: string;
    file?: File;
  }
): Promise<Screenshot> {
  let res: Response;
  if (data.file) {
    const body = new FormData();
    body.append('file', data.file);
    if (data.name !== undefined) body.append('name', data.name);
    if (data.description !== undefined)
      body.append('description', data.description);
    if (data.position !== undefined)
      body.append('position', String(data.position));
    if (data.type !== undefined) body.append('type', data.type);
    res = await fetchWithToken(endpoint(id), {
      method: 'PATCH',
      body,
    });
  } else {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.position !== undefined) payload.position = data.position;
    if (data.type !== undefined) payload.type = data.type;
    res = await fetchWithToken(endpoint(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  if (!res.ok) throw new Error('Failed to update screenshot');
  return res.json();
}

export async function deleteScreenshot(id: number): Promise<void> {
  const res = await fetchWithToken(endpoint(id), { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete screenshot');
}

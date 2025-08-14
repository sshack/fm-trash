'use client';

import { useEffect, useState } from 'react';
import fetchWithToken from '@/utils/apiClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/table';

interface Shot {
  id: number;
  url: string;
  name?: string;
  description?: string;
  position: number;
  journey?: { id: number; name: string };
}

export default function ScreenshotsPage() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);
  const [journeys, setJourneys] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState<{
    file: File | null;
    journeyId: string;
    name: string;
    description: string;
  }>({ file: null, journeyId: '', name: '', description: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithToken('/api/screenshots');
        const data = await res.json();
        setShots(data);
        const jRes = await fetchWithToken('/api/journeys');
        const jData = await jRes.json();
        setJourneys(jData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Screenshots</h1>
      {/* Create */}
      <div className="mb-4 flex items-end gap-2">
        <div>
          <div className="mb-1">Journey</div>
          <Select
            value={form.journeyId}
            onValueChange={(val) => setForm((f) => ({ ...f, journeyId: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select journey" />
            </SelectTrigger>
            <SelectContent>
              {journeys.map((j) => (
                <SelectItem key={j.id} value={String(j.id)}>
                  {j.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-1">File</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))
            }
          />
        </div>
        <div>
          <div className="mb-1">Name</div>
          <input
            className="border rounded p-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <div className="mb-1">Description</div>
          <input
            className="border rounded p-2"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
        <button
          className="px-3 py-2 rounded bg-primary text-white"
          onClick={async () => {
            if (!form.file || !form.journeyId) return;
            const body = new FormData();
            body.append('file', form.file);
            body.append('journeyId', form.journeyId);
            if (form.name) body.append('name', form.name);
            if (form.description) body.append('description', form.description);
            const res = await fetchWithToken('/api/screenshots', {
              method: 'POST',
              body,
            });
            if (res.ok) location.reload();
          }}
        >
          Create
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shots.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>
                  <img src={s.url} alt="" className="h-12 w-12 object-cover" />
                </TableCell>
                <TableCell>{s.name ?? '-'}</TableCell>
                <TableCell>{s.description ?? '-'}</TableCell>
                <TableCell>{s.position}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

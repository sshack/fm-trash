'use client';

import { useEffect, useState } from 'react';
import fetchWithToken from '@/utils/apiClient';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select';

interface Journey {
  id: number;
  name: string;
  segment: string;
  channel: string;
  institution?: { id: number; name: string };
}

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState<
    { id: number; name: string }[]
  >([]);
  const [variants, setVariants] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState<{
    name: string;
    segment: string;
    channel: string;
    productVariantId: string;
    institutionId: string;
  }>({
    name: '',
    segment: 'PF',
    channel: 'WEB',
    productVariantId: '',
    institutionId: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithToken('/api/journeys');
        const data = await res.json();
        setJourneys(data);
        const iRes = await fetchWithToken('/api/institutions');
        const iData = await iRes.json();
        setInstitutions(iData);
        const vRes = await fetchWithToken('/api/product-variants');
        const vData = await vRes.json();
        setVariants(vData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Journeys</h1>
      {/* Create */}
      <div className="mb-4 grid grid-cols-5 gap-2 items-end">
        <div>
          <div className="mb-1">Name</div>
          <input
            className="border rounded p-2 w-full"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <div className="mb-1">Segment</div>
          <Select
            value={form.segment}
            onValueChange={(val) => setForm((f) => ({ ...f, segment: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PF">PF</SelectItem>
              <SelectItem value="PJ">PJ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-1">Channel</div>
          <Select
            value={form.channel}
            onValueChange={(val) => setForm((f) => ({ ...f, channel: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEB">WEB</SelectItem>
              <SelectItem value="MOBILE">MOBILE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-1">Institution</div>
          <Select
            value={form.institutionId}
            onValueChange={(val) =>
              setForm((f) => ({ ...f, institutionId: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select institution" />
            </SelectTrigger>
            <SelectContent>
              {institutions.map((i) => (
                <SelectItem key={i.id} value={String(i.id)}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-1">Product Variant</div>
          <Select
            value={form.productVariantId}
            onValueChange={(val) =>
              setForm((f) => ({ ...f, productVariantId: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((v) => (
                <SelectItem key={v.id} value={String(v.id)}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          className="px-3 py-2 rounded bg-primary text-white"
          onClick={async () => {
            const res = await fetchWithToken('/api/journeys', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: form.name,
                segment: form.segment,
                channel: form.channel,
                productVariantId: Number(form.productVariantId),
                institutionId: Number(form.institutionId),
              }),
            });
            if (res.ok) location.reload();
          }}
          disabled={!form.name || !form.institutionId || !form.productVariantId}
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
              <TableHead>Name</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Channel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journeys.map((j) => (
              <TableRow key={j.id}>
                <TableCell>{j.id}</TableCell>
                <TableCell>{j.name}</TableCell>
                <TableCell>{j.segment}</TableCell>
                <TableCell>{j.channel}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

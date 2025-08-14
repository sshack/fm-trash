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

interface Variant {
  id: number;
  name: string;
  product?: { id: number; name: string };
  journeys?: { id: number }[];
}

export default function VariantsPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState<{ name: string; productId: string }>({
    name: '',
    productId: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithToken('/api/product-variants');
        const data = await res.json();
        setVariants(data);
        const pRes = await fetchWithToken('/api/products');
        const pData = await pRes.json();
        setProducts(pData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Product Variants</h1>
      {/* Create */}
      <div className="mb-4 flex items-end gap-2">
        <div>
          <div className="mb-1">Product</div>
          <Select
            value={form.productId}
            onValueChange={(val) => setForm((f) => ({ ...f, productId: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-1">Name</div>
          <input
            className="border rounded p-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <button
          className="px-3 py-2 rounded bg-primary text-white"
          onClick={async () => {
            const res = await fetchWithToken('/api/product-variants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: form.name,
                productId: Number(form.productId),
              }),
            });
            if (res.ok) location.reload();
          }}
          disabled={!form.name || !form.productId}
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
              <TableHead>Product</TableHead>
              <TableHead>Journeys</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.id}</TableCell>
                <TableCell>{v.name}</TableCell>
                <TableCell>{v.product?.name ?? '-'}</TableCell>
                <TableCell>{v.journeys?.length ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import fetchWithToken from '@/utils/apiClient';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/table';
import { Button } from '@/components/button';
import ProductVariantForm from '@/components/forms/ProductVariantForm';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/dialog';

interface Variant {
  id: number;
  name: string;
  journeys?: Journey[];
}

interface Journey {
  id: number;
  name: string;
}

interface ProductDetail {
  id: number;
  name: string;
  variants: Variant[];
}

export default function ProductDetailPage() {
  const params = useParams();
  // @ts-ignore
  const id = params.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetchWithToken(`/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!product) return <p className="p-4">Product not found.</p>;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Variants</h2>
          {/* Add variant modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">+ New Variant</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Variant</DialogTitle>
              </DialogHeader>
              <ProductVariantForm
                productId={product.id}
                onSuccess={() => location.reload()}
              />
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Journeys</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {product.variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.id}</TableCell>
                <TableCell>{v.name}</TableCell>
                <TableCell>{v.journeys?.length ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

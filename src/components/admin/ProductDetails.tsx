'use client';

import { useEffect, useState } from 'react';
import fetchWithToken from '@/utils/apiClient';
import { Button } from '@/components/button';
import ProductVariantForm from '@/components/forms/ProductVariantForm';
import { deleteProductVariant } from '@/utils/api/productVariants';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/dialog';
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
  journeys?: { id: number }[];
}

interface ProductDetail {
  id: number;
  name: string;
  variants: Variant[];
}

export default function ProductDetails({ productId }: { productId: number }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithToken(`/api/products/${productId}`);
        const data = await res.json();
        setProduct(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  if (loading) return <p className="p-2">Loading...</p>;
  if (!product) return <p className="p-2">Product not found.</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{product.name}</h2>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Variants</h3>
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
                <TableCell className="flex items-center gap-2">
                  {v.journeys?.length ?? 0}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Variant</DialogTitle>
                      </DialogHeader>
                      <ProductVariantForm
                        productId={product.id}
                        variant={v}
                        onSuccess={() => location.reload()}
                      />
                      <DialogFooter className="pt-4">
                        <DialogClose asChild>
                          <Button variant="secondary">Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await deleteProductVariant(v.id);
                      location.reload();
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

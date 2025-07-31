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
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/button';
import ProductForm from '@/components/forms/ProductForm';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/dialog';

interface Product {
  id: number;
  name: string;
  variants?: Variant[];
}

interface Variant {
  id: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetchWithToken('/products');
        const data = await res.json();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" /> New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSuccess={() => location.reload()} />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell>{prod.id}</TableCell>
                <TableCell>{prod.name}</TableCell>
                <TableCell>{prod.variants?.length ?? 0}</TableCell>
                <TableCell>
                  <Link
                    href={`/products/${prod.id}`}
                    className="text-primary underline"
                  >
                    Details
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

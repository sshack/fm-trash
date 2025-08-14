'use client';

import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/form';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import {
  createProductVariant,
  updateProductVariant,
} from '@/utils/api/productVariants';
import { useEffect, useState } from 'react';
import { getProducts } from '@/utils/api/products';
import type { Product } from '@/types/models';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select';
import { useToast } from '@/hooks/use-toast';

interface Props {
  productId?: number;
  onSuccess?: () => void;
  variant?: { id: number; name: string };
}

interface FormValues {
  name: string;
}

export default function ProductVariantForm({
  productId,
  onSuccess,
  variant,
}: Props) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    productId ? String(productId) : ''
  );
  const form = useForm<FormValues>({
    defaultValues: {
      name: variant?.name ?? '',
    },
  });

  useEffect(() => {
    if (!productId) {
      (async () => {
        try {
          const data = await getProducts();
          setProducts(data);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to load products', e);
        }
      })();
    }
  }, [productId]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (variant) {
        await updateProductVariant(variant.id, { name: values.name });
        toast({ title: 'Variant updated' });
      } else {
        const resolvedProductId = productId ?? Number(selectedProductId);
        await createProductVariant({
          name: values.name,
          productId: resolvedProductId,
        });
        toast({ title: 'Variant created' });
      }
      onSuccess?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!productId && (
          <div className="space-y-2">
            <FormLabel>Product</FormLabel>
            <Select
              value={selectedProductId}
              onValueChange={setSelectedProductId}
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
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{variant ? 'Update' : 'Save'}</Button>
      </form>
    </Form>
  );
}

'use client';

import { useEffect, useState } from 'react';
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
import { createJourney } from '@/utils/api/journeys';
import { getProducts } from '@/utils/api/products';
import { useToast } from '@/hooks/use-toast';
import { Segment, Channel, Product } from '@/types/models';

interface Props {
  institutionId: number;
  onSuccess?: () => void;
}

interface FormValues {
  name: string;
  segment: Segment;
  channel: Channel;
  productId: string; // keep as string for select element
  productVariantId: string;
}

export default function JourneyForm({ institutionId, onSuccess }: Props) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);

  // load products with variants
  useEffect(() => {
    (async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load products', e);
      }
    })();
  }, []);

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      segment: Segment.PF,
      channel: Channel.WEB,
      productId: '',
      productVariantId: '',
    },
  });

  const selectedProductId = form.watch('productId');
  const selectedProduct = products.find(
    (p) => p.id === Number(selectedProductId)
  );

  const onSubmit = async (values: FormValues) => {
    try {
      await createJourney({
        name: values.name,
        segment: values.segment,
        channel: values.channel,
        productVariantId: Number(values.productVariantId),
        institutionId,
      });
      toast({ title: 'Journey created' });
      onSuccess?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
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

        {/* Segment */}
        <FormField
          control={form.control}
          name="segment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segment</FormLabel>
              <FormControl>
                <select
                  className="w-full border rounded p-2"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value={Segment.PF}>PF</option>
                  <option value={Segment.PJ}>PJ</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Channel */}
        <FormField
          control={form.control}
          name="channel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel</FormLabel>
              <FormControl>
                <select
                  className="w-full border rounded p-2"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value={Channel.WEB}>WEB</option>
                  <option value={Channel.MOBILE}>MOBILE</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product select */}
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <FormControl>
                <select
                  className="w-full border rounded p-2"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    // reset variant when product changes
                    form.setValue('productVariantId', '');
                  }}
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Variant select */}
        <FormField
          control={form.control}
          name="productVariantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Variant</FormLabel>
              <FormControl>
                <select
                  className="w-full border rounded p-2"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!selectedProduct}
                >
                  <option value="">Select variant</option>
                  {selectedProduct?.variants?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={!form.watch('productVariantId')}>
          Save
        </Button>
      </form>
    </Form>
  );
}

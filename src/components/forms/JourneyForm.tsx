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
import { createJourney, updateJourney } from '@/utils/api/journeys';
import { getProducts } from '@/utils/api/products';
import { useToast } from '@/hooks/use-toast';
import { Segment, Channel, Product } from '@/types/models';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select';

interface Props {
  institutionId: number;
  onSuccess?: () => void;
  journey?: {
    id: number;
    name: string;
    segment: Segment;
    channel: Channel;
    productVariantId: number;
    productVariant?: { product?: { id: number } };
  };
}

interface FormValues {
  name: string;
  segment: Segment;
  channel: Channel;
  productId: string; // keep as string for select element
  productVariantId: string;
}

export default function JourneyForm({
  institutionId,
  onSuccess,
  journey,
}: Props) {
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
      name: journey?.name ?? '',
      segment: journey?.segment ?? Segment.PF,
      channel: journey?.channel ?? Channel.WEB,
      productId: journey?.productVariant?.product?.id
        ? String(journey.productVariant.product.id)
        : '',
      productVariantId: journey?.productVariantId
        ? String(journey.productVariantId)
        : '',
    },
  });

  const selectedProductId = form.watch('productId');
  const selectedProduct = products.find(
    (p) => p.id === Number(selectedProductId)
  );

  const onSubmit = async (values: FormValues) => {
    try {
      if (journey) {
        await updateJourney(journey.id, {
          name: values.name,
          segment: values.segment,
          channel: values.channel,
          productVariantId: Number(values.productVariantId),
        });
        toast({ title: 'Journey updated' });
      } else {
        await createJourney({
          name: values.name,
          segment: values.segment,
          channel: values.channel,
          productVariantId: Number(values.productVariantId),
          institutionId,
        });
        toast({ title: 'Journey created' });
      }
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Segment.PF}>PF</SelectItem>
                    <SelectItem value={Segment.PJ}>PJ</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Channel.WEB}>WEB</SelectItem>
                    <SelectItem value={Channel.MOBILE}>MOBILE</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue('productVariantId', '');
                  }}
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
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedProduct}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct?.variants?.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={!form.watch('productVariantId')}>
          {journey ? 'Update' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}

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
import { createProduct, updateProduct } from '@/utils/api/products';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onSuccess?: () => void;
  product?: { id: number; name: string };
}

interface FormValues {
  name: string;
}

export default function ProductForm({ onSuccess, product }: Props) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      name: product?.name ?? '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (product) {
        await updateProduct(product.id, { name: values.name });
        toast({ title: 'Product updated' });
      } else {
        await createProduct({ name: values.name });
        toast({ title: 'Product created' });
      }
      onSuccess?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <Button type="submit">{product ? 'Update' : 'Save'}</Button>
      </form>
    </Form>
  );
}

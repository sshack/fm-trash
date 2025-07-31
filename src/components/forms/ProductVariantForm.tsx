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
import { createProductVariant } from '@/utils/api/productVariants';
import { useToast } from '@/hooks/use-toast';

interface Props {
  productId: number;
  onSuccess?: () => void;
}

interface FormValues {
  name: string;
}

export default function ProductVariantForm({ productId, onSuccess }: Props) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createProductVariant({ name: values.name, productId });
      toast({ title: 'Variant created' });
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
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}

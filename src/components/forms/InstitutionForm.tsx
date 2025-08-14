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
import { createInstitution, updateInstitution } from '@/utils/api/institutions';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onSuccess?: () => void;
  institution?: { id: number; name: string; sector: string; logo: string };
}

interface FormValues {
  name: string;
  sector: string;
  logo: FileList | null;
}

export default function InstitutionForm({ onSuccess, institution }: Props) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      name: institution?.name ?? '',
      sector: institution?.sector ?? '',
      logo: null,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (institution) {
        await updateInstitution(institution.id, {
          name: values.name,
          sector: values.sector,
          logo: values.logo ? values.logo[0] : null,
        });
        toast({ title: 'Institution updated' });
      } else {
        await createInstitution({
          name: values.name,
          sector: values.sector,
          logo: values.logo ? values.logo[0] : null,
        });
        toast({ title: 'Institution created' });
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
        <FormField
          control={form.control}
          name="sector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sector</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{institution ? 'Update' : 'Save'}</Button>
      </form>
    </Form>
  );
}

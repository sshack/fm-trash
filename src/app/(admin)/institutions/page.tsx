'use client';

import { useEffect, useState } from 'react';
import { getInstitutions } from '@/utils/api/institutions';
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
import InstitutionForm from '@/components/forms/InstitutionForm';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/dialog';
import { deleteInstitution } from '@/utils/api/institutions';
import { useToast } from '@/hooks/use-toast';
import InstitutionDetails from '@/components/admin/InstitutionDetails';

interface Institution {
  id: number;
  name: string;
  logo: string;
  sector: string;
  journeys?: Journey[];
}

interface Journey {
  id: number;
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await getInstitutions();
        setInstitutions(data);
      } catch (error) {
        console.error('Failed to fetch institutions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Institutions</h1>
        {/* Create institution modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" /> New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Institution</DialogTitle>
            </DialogHeader>
            <InstitutionForm onSuccess={() => location.reload()} />
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
              <TableHead>Sector</TableHead>
              <TableHead>Journeys</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institutions.map((inst) => (
              <TableRow key={inst.id}>
                <TableCell>{inst.id}</TableCell>
                <TableCell>{inst.name}</TableCell>
                <TableCell>{inst.sector}</TableCell>
                <TableCell>{inst.journeys?.length ?? 0}</TableCell>
                <TableCell className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Institution #{inst.id}</DialogTitle>
                      </DialogHeader>
                      <InstitutionDetails institutionId={inst.id} />
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
                      try {
                        await deleteInstitution(inst.id);
                        toast({ title: 'Deleted' });
                        setInstitutions((prev) =>
                          prev.filter((i) => i.id !== inst.id)
                        );
                      } catch (e: any) {
                        toast({ title: 'Error', description: e.message });
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

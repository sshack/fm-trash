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

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await fetchWithToken('/institutions');
        const data = await res.json();
        setInstitutions(data);
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
                <TableCell>
                  <Link
                    href={`/institutions/${inst.id}`}
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

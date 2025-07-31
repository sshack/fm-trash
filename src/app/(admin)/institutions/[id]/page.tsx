'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import fetchWithToken from '@/utils/apiClient';
import JourneyForm from '@/components/forms/JourneyForm';
import ScreenshotManager from '@/components/ScreenshotManager';
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
import { Button } from '@/components/button';
import { Screenshot } from '@/types/models';

interface Journey {
  id: number;
  name: string;
  segment: string;
  channel: string;
  screenshots: Screenshot[];
}

interface InstitutionDetail {
  id: number;
  name: string;
  logo: string;
  sector: string;
  journeys: Journey[];
}

export default function InstitutionDetailPage() {
  const params = useParams();
  // @ts-ignore
  const id = params.id as string;
  const [institution, setInstitution] = useState<InstitutionDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const res = await fetchWithToken(`/institutions/${id}`);
        const data = await res.json();
        setInstitution(data);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitution();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!institution) return <p className="p-4">Institution not found.</p>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <img src={institution.logo} alt="logo" className="h-12 w-12" />
        <div>
          <h1 className="text-2xl font-semibold">{institution.name}</h1>
          <p className="text-muted-foreground">Sector: {institution.sector}</p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Journeys</h2>
          {/* Add journey modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">+ New Journey</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Journey</DialogTitle>
              </DialogHeader>
              <JourneyForm
                institutionId={institution.id}
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
              <TableHead>Segment</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Screenshots</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institution.journeys.map((j) => (
              <TableRow key={j.id}>
                <TableCell>{j.id}</TableCell>
                <TableCell>{j.name}</TableCell>
                <TableCell>{j.segment}</TableCell>
                <TableCell>{j.channel}</TableCell>
                <TableCell>
                  {j.screenshots.length}{' '}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" size="xs">
                        Manage
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Screenshots for {j.name}</DialogTitle>
                      </DialogHeader>
                      <ScreenshotManager
                        journeyId={j.id}
                        initialScreenshots={j.screenshots}
                        refresh={() => location.reload()}
                      />
                      <DialogFooter className="pt-4">
                        <DialogClose asChild>
                          <Button variant="secondary">Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

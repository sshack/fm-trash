'use client';

import { useEffect, useState } from 'react';
import fetchWithToken from '@/utils/apiClient';
import InstitutionForm from '@/components/forms/InstitutionForm';
import JourneyForm from '@/components/forms/JourneyForm';
import ScreenshotManager from '@/components/ScreenshotManager';
import { Button } from '@/components/button';
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
import { Screenshot } from '@/types/models';
import { deleteJourney } from '@/utils/api/journeys';

interface JourneyDetail {
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
  journeys: JourneyDetail[];
}

export default function InstitutionDetails({
  institutionId,
}: {
  institutionId: number;
}) {
  const [institution, setInstitution] = useState<InstitutionDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithToken(`/api/institutions/${institutionId}`);
        const data = await res.json();
        setInstitution(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [institutionId]);

  if (loading) return <p className="p-2">Loading...</p>;
  if (!institution) return <p className="p-2">Institution not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src={institution.logo} alt="logo" className="h-10 w-10" />
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{institution.name}</h2>
          <p className="text-muted-foreground">Sector: {institution.sector}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Edit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Institution</DialogTitle>
            </DialogHeader>
            <InstitutionForm
              institution={institution}
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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Journeys</h3>
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
              <TableHead></TableHead>
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
                <TableCell className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Journey</DialogTitle>
                      </DialogHeader>
                      <JourneyForm
                        institutionId={institution.id}
                        journey={j as any}
                        onSuccess={() => location.reload()}
                      />
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
                      await deleteJourney(j.id);
                      location.reload();
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

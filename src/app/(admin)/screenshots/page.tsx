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
import BatchScreenshotUploadModal from '@/components/BatchScreenshotUploadModal';

interface Shot {
  id: number;
  url: string;
  name?: string;
  description?: string;
  position: number;
  journey?: { id: number; name: string };
}

export default function ScreenshotsPage() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);
  const [journeys, setJourneys] = useState<
    { id: number; name: string; institution: { name: string } }[]
  >([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithToken('/api/screenshots');
      const data = await res.json();
      setShots(data);
      const jRes = await fetchWithToken('/api/journeys');
      const jData = await jRes.json();
      setJourneys(jData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Screenshots</h1>
        <BatchScreenshotUploadModal 
          journeys={journeys} 
          onSuccess={loadData}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Journey</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shots.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>
                  <img src={s.url} alt="" className="h-12 w-12 object-cover" />
                </TableCell>
                <TableCell>{s.name ?? '-'}</TableCell>
                <TableCell>{s.description ?? '-'}</TableCell>
                <TableCell>{s.position}</TableCell>
                <TableCell>{s.journey?.name || '-'}</TableCell>
                <TableCell>
                  <button
                    className="px-2 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this screenshot?')) {
                        try {
                          const res = await fetchWithToken(
                            `/api/screenshots/${s.id}`,
                            {
                              method: 'DELETE',
                            }
                          );
                          if (res.ok) {
                            await loadData(); // Use loadData instead of location.reload()
                          } else {
                            const error = await res.json();
                            alert(`Failed to delete: ${error.message || 'Unknown error'}`);
                          }
                        } catch (error) {
                          console.error('Delete error:', error);
                          alert('Failed to delete screenshot. Please try again.');
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

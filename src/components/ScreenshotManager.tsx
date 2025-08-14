'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/table';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { useToast } from '@/hooks/use-toast';
import {
  createScreenshot,
  createScreenshotsBatch,
  deleteScreenshot,
  updateScreenshot,
} from '@/utils/api/screenshots';
import { Screenshot } from '@/types/models';
import { ArrowUp, ArrowDown, Trash } from 'lucide-react';
import BatchScreenshotUploadModal from './BatchScreenshotUploadModal';

interface Props {
  journeyId: number;
  initialScreenshots: Screenshot[];
  refresh?: () => void; // callback to reload parent data
}

interface Journey {
  id: number;
  name: string;
  institution: { name: string };
}

type EditableShot = Screenshot & { dirty?: boolean };

export default function ScreenshotManager({
  journeyId,
  initialScreenshots,
  refresh,
}: Props) {
  const { toast } = useToast();
  const [existing, setExisting] = useState<EditableShot[]>(
    [...initialScreenshots].sort((a, b) => a.position - b.position)
  );

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [fileMetadata, setFileMetadata] = useState<{
    [key: string]: { name: string; description: string; position: number };
  }>({});

  // reorder helpers
  const move = (index: number, dir: -1 | 1) => {
    const arr = [...existing];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    // update positions locally
    const reordered = arr.map((s, i) => ({ ...s, position: i, dirty: true }));
    setExisting(reordered);
  };

  const savePositionChanges = async () => {
    const dirtyOnes = existing.filter((s) => s.dirty);
    try {
      await Promise.all(
        dirtyOnes.map((s) => updateScreenshot(s.id, { position: s.position }))
      );
      toast({ title: 'Positions updated' });
      setExisting((prev) => prev.map((p) => ({ ...p, dirty: false })));
      refresh?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message });
    }
  };

  const handleMetaSave = async (shot: EditableShot) => {
    try {
      const updates: Promise<unknown>[] = [];

      // Build payload for the screenshot being saved (include position if it is dirty)
      const payload: Record<string, unknown> = {
        name: shot.name,
        description: shot.description,
      };
      if (shot.dirty) {
        payload.position = shot.position;
      }
      updates.push(updateScreenshot(shot.id, payload));

      // If there are other screenshots with dirty positions, update them as well
      const otherDirty = existing.filter((s) => s.dirty && s.id !== shot.id);
      otherDirty.forEach((s) =>
        updates.push(updateScreenshot(s.id, { position: s.position }))
      );

      await Promise.all(updates);

      toast({ title: 'Screenshot(s) updated' });
      // Reset dirty flags locally
      setExisting((prev) => prev.map((p) => ({ ...p, dirty: false })));
      refresh?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this screenshot?')) {
      return;
    }
    
    try {
      await deleteScreenshot(id);
      toast({ title: 'Success', description: 'Screenshot deleted successfully' });
      setExisting((prev) => prev.filter((s) => s.id !== id));
      refresh?.();
    } catch (e: any) {
      toast({ 
        title: 'Error', 
        description: e.message || 'Failed to delete screenshot',
        variant: 'destructive'
      });
      console.error('Delete error:', e);
    }
  };

  const handleUpload = async () => {
    if (newFiles.length === 0) return;
    try {
      const payloads = newFiles.map((file) => {
        const meta = fileMetadata[file.name] || {
          name: file.name,
          description: '',
          position: existing.length + newFiles.indexOf(file),
        };
        return {
          journeyId,
          file,
          name: meta.name,
          description: meta.description,
          position: meta.position,
        };
      });

      await createScreenshotsBatch(payloads);
      toast({ title: 'Uploaded' });
      setNewFiles([]);
      setFileMetadata({});
      refresh?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing shots table */}
      <h3 className="text-lg font-semibold">Existing Screenshots</h3>
      {existing.length === 0 ? (
        <p>None</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pos</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {existing.map((shot, idx) => (
                <TableRow key={shot.id}>
                  <TableCell className="flex items-center gap-1">
                    {shot.position}
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => move(idx, -1)}
                    >
                      <ArrowUp size={12} />
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => move(idx, 1)}
                    >
                      <ArrowDown size={12} />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <img
                      src={shot.url}
                      alt="prev"
                      className="h-16 w-16 object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={shot.name ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExisting((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], name: val };
                          return arr;
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={shot.description ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExisting((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], description: val };
                          return arr;
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => handleMetaSave(shot)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(shot.id)}
                    >
                      <Trash size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {existing.some((s) => s.dirty) && (
            <Button onClick={savePositionChanges}>Save Order</Button>
          )}
        </>
      )}

      {/* Upload new */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Add Screenshots</h3>
          <BatchScreenshotUploadModal 
            journeys={[{ id: journeyId, name: 'Current Journey', institution: { name: '' } }]}
            onSuccess={refresh}
            trigger={<Button variant="outline">Batch Upload</Button>}
          />
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files) {
              const files = Array.from(e.target.files);
              setNewFiles(files);
              // Initialize metadata for each file
              const metadata: {
                [key: string]: {
                  name: string;
                  description: string;
                  position: number;
                };
              } = {};
              files.forEach((file, index) => {
                metadata[file.name] = {
                  name: file.name,
                  description: '',
                  position: existing.length + index,
                };
              });
              setFileMetadata(metadata);
            }
          }}
        />

        {newFiles.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Configure Files:</h4>
            <div className="space-y-2">
              {newFiles.map((file) => (
                <div
                  key={file.name}
                  className="grid grid-cols-4 gap-2 items-center p-2 border rounded"
                >
                  <div className="text-sm font-medium truncate">
                    {file.name}
                  </div>
                  <Input
                    placeholder="Display name"
                    value={fileMetadata[file.name]?.name || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFileMetadata((prev) => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], name: val },
                      }));
                    }}
                  />
                  <Input
                    placeholder="Description"
                    value={fileMetadata[file.name]?.description || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFileMetadata((prev) => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], description: val },
                      }));
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Position"
                    value={fileMetadata[file.name]?.position || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setFileMetadata((prev) => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], position: val },
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleUpload} disabled={newFiles.length === 0}>
          Upload{' '}
          {newFiles.length > 0
            ? `${newFiles.length} Screenshots`
            : 'Screenshots'}
        </Button>
      </div>
    </div>
  );
}

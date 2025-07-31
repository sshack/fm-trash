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
  deleteScreenshot,
  updateScreenshot,
} from '@/utils/api/screenshots';
import { Screenshot } from '@/types/models';
import { ArrowUp, ArrowDown, Trash } from 'lucide-react';

interface Props {
  journeyId: number;
  initialScreenshots: Screenshot[];
  refresh?: () => void; // callback to reload parent data
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
    try {
      await deleteScreenshot(id);
      toast({ title: 'Deleted' });
      setExisting((prev) => prev.filter((s) => s.id !== id));
      refresh?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message });
    }
  };

  const handleUpload = async () => {
    if (newFiles.length === 0) return;
    try {
      await Promise.all(
        newFiles.map((file, idx) =>
          createScreenshot({
            journeyId,
            file,
            position: existing.length + idx,
            name: file.name,
          })
        )
      );
      toast({ title: 'Uploaded' });
      setNewFiles([]);
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
        <h3 className="text-lg font-semibold">Add Screenshots</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files) setNewFiles(Array.from(e.target.files));
          }}
        />
        {newFiles.length > 0 && (
          <ul className="list-disc ml-4">
            {newFiles.map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        )}
        <Button onClick={handleUpload} disabled={newFiles.length === 0}>
          Upload
        </Button>
      </div>
    </div>
  );
}

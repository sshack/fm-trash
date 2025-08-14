'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { useToast } from '@/hooks/use-toast';
import { createScreenshotsBatch } from '@/utils/api/screenshots';
import { Upload, Plus, X, GripVertical } from 'lucide-react';

interface Journey {
  id: number;
  name: string;
  institution: { name: string };
}

interface ScreenshotRow {
  id: string;
  file: File | null;
  name: string;
  description: string;
  position: number;
}

interface Props {
  journeys: Journey[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function BatchScreenshotUploadModal({
  journeys,
  onSuccess,
  trigger,
}: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>('');
  const [rows, setRows] = useState<ScreenshotRow[]>([
    {
      id: crypto.randomUUID(),
      file: null,
      name: '',
      description: '',
      position: 0,
    },
  ]);
  const [uploading, setUploading] = useState(false);

  const addRow = () => {
    const newRow: ScreenshotRow = {
      id: crypto.randomUUID(),
      file: null,
      name: '',
      description: '',
      position: rows.length,
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return; // Keep at least one row
    setRows(rows.filter((row) => row.id !== id));
    // Reorder positions
    const updatedRows = rows.filter((row) => row.id !== id);
    updatedRows.forEach((row, index) => {
      row.position = index;
    });
    setRows(updatedRows);
  };

  const updateRow = (id: string, updates: Partial<ScreenshotRow>) => {
    setRows(
      rows.map((row) =>
        row.id === id ? { ...row, ...updates } : row
      )
    );
  };

  const moveRow = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= rows.length) return;
    
    const newRows = [...rows];
    const [movedRow] = newRows.splice(fromIndex, 1);
    newRows.splice(toIndex, 0, movedRow);
    
    // Update positions
    newRows.forEach((row, index) => {
      row.position = index;
    });
    
    setRows(newRows);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, rowId: string) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const file = imageFiles[0];
      updateRow(rowId, {
        file,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, rowId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      updateRow(rowId, {
        file,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      });
    }
  };

  const handleSave = async () => {
    if (!selectedJourneyId) {
      toast({ title: 'Error', description: 'Please select a journey' });
      return;
    }

    const validRows = rows.filter((row) => row.file);
    if (validRows.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one file' });
      return;
    }

    setUploading(true);
    try {
      const payloads = validRows.map((row) => ({
        journeyId: Number(selectedJourneyId),
        file: row.file!,
        name: row.name || row.file!.name,
        description: row.description,
        position: row.position,
      }));

      await createScreenshotsBatch(payloads);
      toast({ title: 'Success', description: 'Screenshots uploaded successfully' });
      
      // Reset form
      setSelectedJourneyId('');
      setRows([
        {
          id: crypto.randomUUID(),
          file: null,
          name: '',
          description: '',
          position: 0,
        },
      ]);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload screenshots' });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Batch Upload
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Screenshot Upload</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Journey Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Journey</label>
            <Select value={selectedJourneyId} onValueChange={setSelectedJourneyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select journey" />
              </SelectTrigger>
              <SelectContent>
                {journeys.map((journey) => (
                  <SelectItem key={journey.id} value={String(journey.id)}>
                    {journey.name} - {journey.institution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Screenshot Rows */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Screenshots</h3>
              <Button onClick={addRow} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid grid-cols-12 gap-3 items-center p-3 border rounded-lg bg-gray-50"
                >
                  {/* Drag Handle */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      className="cursor-move text-gray-400 hover:text-gray-600"
                      onMouseDown={(e) => {
                        // Simple drag implementation
                        const startY = e.clientY;
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaY = e.clientY - startY;
                          if (Math.abs(deltaY) > 30) {
                            const direction = deltaY > 0 ? 1 : -1;
                            moveRow(index, index + direction);
                            document.removeEventListener('mousemove', handleMouseMove);
                          }
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                        }, { once: true });
                      }}
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* File Drop Zone */}
                  <div className="col-span-3">
                    <div
                      className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                        row.file
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDrop={(e) => handleFileDrop(e, row.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => handleFileSelect(e as any, row.id);
                        input.click();
                      }}
                    >
                      {row.file ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-green-700">
                            {row.file.name}
                          </div>
                          <div className="text-xs text-green-600">
                            {(row.file.size / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="w-5 h-5 mx-auto text-gray-400" />
                          <div className="text-xs text-gray-500">
                            Drop image or click
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="col-span-3">
                    <Input
                      placeholder="Display name"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, { name: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-3">
                    <Input
                      placeholder="Description"
                      value={row.description}
                      onChange={(e) => updateRow(row.id, { description: e.target.value })}
                    />
                  </div>

                  {/* Position */}
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={row.position}
                      onChange={(e) =>
                        updateRow(row.id, { position: parseInt(e.target.value) || 0 })
                      }
                      className="text-center"
                    />
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-center">
                    <Button
                      onClick={() => removeRow(row.id)}
                      variant="ghost"
                      size="sm"
                      disabled={rows.length === 1}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={uploading}>
              {uploading ? 'Uploading...' : `Save ${rows.filter(r => r.file).length} Screenshots`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

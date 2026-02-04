'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pin, Trash2, Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note: Note | null;
  onSave: (data: { title: string; content: string; tags: string[]; pinned: boolean }) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
}

export function NoteEditor({ note, onSave, onDelete, isLoading, isSaving }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [pinned, setPinned] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTagsInput(note.tags.join(', '));
      setPinned(note.pinned);
      setHasChanges(false);
    }
  }, [note]);

  useEffect(() => {
    if (note) {
      const changed =
        title !== note.title ||
        content !== note.content ||
        tagsInput !== note.tags.join(', ') ||
        pinned !== note.pinned;
      setHasChanges(changed);
    }
  }, [title, content, tagsInput, pinned, note]);

  const handleSave = async () => {
    if (!note || !hasChanges) return;

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    await onSave({ title, content, tags, pinned });
    setHasChanges(false);
  };

  const handleDelete = async () => {
    await onDelete();
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300 p-6 bg-surface rounded-xl border border-border hide-scrollbar">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-lg font-semibold"
          />
        </div>
        <div className="flex items-center gap-2">
          {isSaving ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          ) : hasChanges ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              Unsaved changes
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-success">
              <Check className="h-4 w-4" />
              Saved
            </div>
          )}
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        className="min-h-[300px] resize-y"
      />

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="work, ideas, personal..."
          />
          {tagsInput && (
            <div className="flex gap-2 flex-wrap mt-2">
              {tagsInput
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0)
                .map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch checked={pinned} onCheckedChange={setPinned} />
            <label className="text-sm font-medium flex items-center gap-2">
              <Pin className={cn('h-4 w-4', pinned && 'text-accent fill-accent')} />
              Pin this note
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="min-w-24"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

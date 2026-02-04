'use client';

import { Note } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string;
  onSelectNote: (noteId: string) => void;
  isLoading?: boolean;
}

export function NoteList({ notes, selectedNoteId, onSelectNote, isLoading }: NoteListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="cursor-pointer">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Card
          key={note.id}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md hover:border-accent/50',
            selectedNoteId === note.id && 'border-accent shadow-md bg-surface2'
          )}
          onClick={() => onSelectNote(note.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base font-semibold line-clamp-1 flex-1">
                {note.title}
              </CardTitle>
              {note.pinned && (
                <Pin className="h-4 w-4 text-accent fill-accent flex-shrink-0" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted line-clamp-2">
              {note.content}
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
              </div>
              {note.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {note.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{note.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

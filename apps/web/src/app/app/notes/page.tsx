'use client';

import { AppShell } from '@/components/app-shell/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function NotesPage() {
  const handleNewNote = () => {
    toast.success('New note feature coming soon!');
  };

  return (
    <AppShell
      title="Notes"
      action={{
        label: 'New Note',
        onClick: handleNewNote,
      }}
    >
      <div className="space-y-4">
        <Input placeholder="Search notes..." className="max-w-md" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="cursor-pointer transition-colors hover:bg-surface2">
              <CardHeader>
                <CardTitle className="text-base">Note {i}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted line-clamp-3">
                  This is a placeholder note content. In a real application, this would
                  contain the actual note text with rich formatting support.
                </p>
                <p className="mt-2 text-xs text-muted">Updated 2 hours ago</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No notes yet"
          description="Start capturing your ideas by creating your first note."
          action={
            <Button onClick={handleNewNote}>
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          }
        />
      </div>
    </AppShell>
  );
}

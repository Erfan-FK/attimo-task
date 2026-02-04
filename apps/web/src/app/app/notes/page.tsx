'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
  CustomSelect,
  CustomSelectTrigger,
  CustomSelectContent,
  CustomSelectItem,
  CustomSelectValue,
} from '@/components/ui/custom-select';
import { NoteList } from '@/components/notes/note-list';
import { NoteEditor } from '@/components/notes/note-editor';
import { AIToolsPanel } from '@/components/notes/ai-tools-panel';
import { notesApi, Note, tasksApi } from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Plus, Search, Pin, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedNoteId = searchParams.get('note');

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPinned, setFilterPinned] = useState<boolean | undefined>(undefined);
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortBy, setSortBy] = useState('updated_desc');

  const sortOptions = [
    { value: 'updated_desc', label: 'Recently Updated' },
    { value: 'updated_asc', label: 'Oldest Updated' },
    { value: 'created_desc', label: 'Recently Created' },
    { value: 'created_asc', label: 'Oldest Created' },
    { value: 'title_asc', label: 'Title (A-Z)' },
    { value: 'title_desc', label: 'Title (Z-A)' },
  ];

  // Extract all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes]);

  // Fetch notes
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await notesApi.getAll({
        q: searchQuery || undefined,
        tag: filterTag || undefined,
        pinned: filterPinned,
        sort: sortBy,
        limit: 100,
      });
      setNotes(response.data.notes);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch selected note
  const fetchNote = async (noteId: string) => {
    try {
      setIsLoadingNote(true);
      const response = await notesApi.getById(noteId);
      setSelectedNote(response.data.note);
    } catch (error) {
      toast.error('Failed to load note');
      router.push('/app/notes');
    } finally {
      setIsLoadingNote(false);
    }
  };

  // Load notes on mount and when filters change
  useEffect(() => {
    fetchNotes();
  }, [searchQuery, filterPinned, filterTag, sortBy]);

  // Load selected note when URL changes
  useEffect(() => {
    if (selectedNoteId) {
      fetchNote(selectedNoteId);
    } else {
      setSelectedNote(null);
    }
  }, [selectedNoteId]);

  const handleSelectNote = (noteId: string) => {
    router.push(`/app/notes?note=${noteId}`);
  };

  const handleNewNote = async () => {
    try {
      const response = await notesApi.create({
        title: 'Untitled Note',
        content: '',
        tags: [],
        pinned: false,
      });
      toast.success('Note created');
      await fetchNotes();
      router.push(`/app/notes?note=${response.data.note.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create note');
    }
  };

  const handleSaveNote = async (data: {
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
  }) => {
    if (!selectedNote) return;

    try {
      setIsSaving(true);
      await notesApi.update(selectedNote.id, data);
      toast.success('Note saved');
      await fetchNotes();
      await fetchNote(selectedNote.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    try {
      await notesApi.delete(selectedNote.id);
      toast.success('Note deleted');
      router.push('/app/notes');
      await fetchNotes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete note');
    }
  };

  const handleCreateTasksFromAI = async (actionItems: string[]) => {
    try {
      const promises = actionItems.map((title) =>
        tasksApi.create({
          title,
          description: `Created from note: ${selectedNote?.title}`,
          status: 'todo',
          priority: 2,
        })
      );
      
      await Promise.all(promises);
      toast.success(`Created ${actionItems.length} tasks! Navigate to Tasks page to view them.`);
    } catch (error) {
      throw new Error('Failed to create tasks');
    }
  };

  const showEmptyState = !isLoading && notes.length === 0 && !searchQuery && !filterTag && filterPinned === undefined;

  return (
    <AppShell
      title="Notes"
      action={{
        label: 'New Note',
        onClick: handleNewNote,
      }}
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Sidebar - Note List */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 h-full">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={filterPinned === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPinned(filterPinned === true ? undefined : true)}
              >
                <Pin className={cn('h-3 w-3 mr-1', filterPinned === true && 'fill-current')} />
                Pinned
              </Button>

              {allTags.length > 0 && (
                <CustomSelect value={filterTag || 'all'} onValueChange={(value) => setFilterTag(value === 'all' ? '' : value)}>
                  <CustomSelectTrigger>
                    <CustomSelectValue placeholder="All Tags" />
                  </CustomSelectTrigger>
                  <CustomSelectContent>
                    <CustomSelectItem value="all">All Tags</CustomSelectItem>
                    {allTags.map((tag) => (
                      <CustomSelectItem key={tag} value={tag}>
                        {tag}
                      </CustomSelectItem>
                    ))}
                  </CustomSelectContent>
                </CustomSelect>
              )}
            </div>

            <CustomSelect value={sortBy} onValueChange={setSortBy}>
              <CustomSelectTrigger>
                <CustomSelectValue />
              </CustomSelectTrigger>
              <CustomSelectContent>
                {sortOptions.map((option) => (
                  <CustomSelectItem key={option.value} value={option.value}>
                    {option.label}
                  </CustomSelectItem>
                ))}
              </CustomSelectContent>
            </CustomSelect>

            {(searchQuery || filterTag || filterPinned !== undefined) && (
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{notes.length} result{notes.length !== 1 ? 's' : ''}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterTag('');
                    setFilterPinned(undefined);
                  }}
                  className="h-6 px-2"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
            {showEmptyState ? (
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
            ) : (
              <NoteList
                notes={notes}
                selectedNoteId={selectedNoteId || undefined}
                onSelectNote={handleSelectNote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

        {/* Right Side - Note Editor and AI Panel */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Note Editor Section */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {selectedNote ? (
              <NoteEditor
                note={selectedNote}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
                isLoading={isLoadingNote}
                isSaving={isSaving}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={<FileText className="h-6 w-6" />}
                  title="No note selected"
                  description="Select a note from the list to view and edit"
                />
              </div>
            )}
          </div>

          {/* AI Tools Panel - Fixed width, full height */}
          {selectedNote && (
            <div className="w-80 flex-shrink-0 overflow-y-auto custom-scrollbar">
              <AIToolsPanel
                noteId={selectedNote.id}
                onCreateTasks={handleCreateTasksFromAI}
              />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

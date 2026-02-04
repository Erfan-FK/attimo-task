'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  CustomSelect,
  CustomSelectTrigger,
  CustomSelectContent,
  CustomSelectItem,
  CustomSelectValue,
} from '@/components/ui/custom-select';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { DateTimePicker } from '@/components/ui/date-time-picker';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string(),
  status: z.enum(['todo', 'in_progress', 'done', 'archived']),
  priority: z.number().int().min(1).max(5),
  deadline: z.string().nullable(),
  tags: z.array(z.string()),
});

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TaskFormData) => Promise<void>;
  task?: Task | null;
  isSaving?: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done' | 'archived';
  priority: number;
  deadline: string | null;
  tags: string[];
}

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived' },
];

const priorityOptions = [
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'High' },
  { value: '4', label: 'Urgent' },
  { value: '5', label: 'Critical' },
];

export function TaskModal({ open, onClose, onSave, task, isSaving }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done' | 'archived'>('todo');
  const [priority, setPriority] = useState('2');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(String(task.priority));
      setDeadline(task.deadline ? new Date(task.deadline) : null);
      setTagsInput(task.tags.join(', '));
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('2');
      setDeadline(null);
      setTagsInput('');
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const formData = {
      title,
      description,
      status,
      priority: parseInt(priority),
      deadline: deadline ? deadline.toISOString() : null,
      tags,
    };

    // Validate form data
    const validation = taskFormSchema.safeParse(formData);
    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        toast.error(issue.message);
      });
      return;
    }

    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <CustomSelect value={status} onValueChange={(value) => setStatus(value as any)}>
                <CustomSelectTrigger>
                  <CustomSelectValue />
                </CustomSelectTrigger>
                <CustomSelectContent>
                  {statusOptions.map((option) => (
                    <CustomSelectItem key={option.value} value={option.value}>
                      {option.label}
                    </CustomSelectItem>
                  ))}
                </CustomSelectContent>
              </CustomSelect>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <CustomSelect value={priority} onValueChange={setPriority}>
                <CustomSelectTrigger>
                  <CustomSelectValue />
                </CustomSelectTrigger>
                <CustomSelectContent>
                  {priorityOptions.map((option) => (
                    <CustomSelectItem key={option.value} value={option.value}>
                      {option.label}
                    </CustomSelectItem>
                  ))}
                </CustomSelectContent>
              </CustomSelect>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Deadline (Optional)</label>
            <DateTimePicker
              value={deadline}
              onChange={setDeadline}
              placeholder="Select date and time"
            />
            <p className="text-xs text-muted mt-1">Set a due date and time for this task</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="work, urgent, project..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

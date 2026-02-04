'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CustomSelect,
  CustomSelectTrigger,
  CustomSelectContent,
  CustomSelectItem,
  CustomSelectValue,
} from '@/components/ui/custom-select';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskModal, TaskFormData } from '@/components/tasks/task-modal';
import { tasksApi, Task } from '@/lib/api';
import { toast } from 'sonner';
import { CheckSquare, Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'archived', label: 'Archived' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: '1', label: 'Low' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'High' },
    { value: '4', label: 'Urgent' },
    { value: '5', label: 'Critical' },
  ];

  const sortOptions = [
    { value: 'created_desc', label: 'Recently Created' },
    { value: 'created_asc', label: 'Oldest Created' },
    { value: 'deadline_asc', label: 'Deadline (Earliest)' },
    { value: 'deadline_desc', label: 'Deadline (Latest)' },
    { value: 'priority_desc', label: 'Priority (High to Low)' },
    { value: 'priority_asc', label: 'Priority (Low to High)' },
  ];

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await tasksApi.getAll({
        q: searchQuery || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        priority: filterPriority !== 'all' ? parseInt(filterPriority) : undefined,
        sort: sortBy,
        limit: 100,
      });
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchQuery, filterStatus, filterPriority, sortBy]);

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (data: TaskFormData) => {
    try {
      setIsSaving(true);
      if (editingTask) {
        await tasksApi.update(editingTask.id, data);
        toast.success('Task updated successfully');
      } else {
        await tasksApi.create(data);
        toast.success('Task created successfully');
      }
      setIsModalOpen(false);
      await fetchTasks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await tasksApi.update(taskId, { status: newStatus });
      toast.success(newStatus === 'done' ? 'Task completed!' : 'Task reopened');
      await fetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;

    try {
      await tasksApi.delete(deleteTaskId);
      toast.success('Task deleted successfully');
      setDeleteTaskId(null);
      await fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const showEmptyState = !isLoading && tasks.length === 0 && !searchQuery && filterStatus === 'all' && filterPriority === 'all';

  return (
    <AppShell
      title="Tasks"
      action={{
        label: 'New Task',
        onClick: handleNewTask,
      }}
    >
      <div className="flex flex-col h-full">
        {/* Fixed Filters Section */}
        <div className="flex-shrink-0 space-y-3 pb-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <CustomSelect value={filterStatus} onValueChange={setFilterStatus}>
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

            <CustomSelect value={filterPriority} onValueChange={setFilterPriority}>
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
          </div>

          {(searchQuery || filterStatus !== 'all' || filterPriority !== 'all') && (
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                }}
                className="h-6 px-2"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable Tasks Section */}
        <div className="flex-1 overflow-y-auto pt-6 custom-scrollbar">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3 p-4 border border-border rounded-xl">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : showEmptyState ? (
          <EmptyState
            icon={<CheckSquare className="h-6 w-6" />}
            title="No tasks yet"
            description="Create your first task to get started and stay organized."
            action={
              <Button onClick={handleNewTask}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            }
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="h-6 w-6" />}
            title="No tasks found"
            description="Try adjusting your filters or search query."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={setDeleteTaskId}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTaskId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

'use client';

import { Task } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Edit, Trash2, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string, currentStatus: Task['status']) => void;
}

const priorityConfig = {
  1: { label: 'Low', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  2: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  3: { label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  4: { label: 'Urgent', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  5: { label: 'Critical', color: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100' },
};

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  done: { label: 'Done', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

function getDeadlineInfo(deadline: string | null) {
  if (!deadline) return null;
  
  const date = new Date(deadline);
  const now = new Date();
  
  if (isPast(date) && !isToday(date)) {
    return { label: 'Overdue', color: 'text-error', icon: AlertCircle };
  }
  if (isToday(date)) {
    return { label: 'Due Today', color: 'text-warning', icon: Clock };
  }
  if (isTomorrow(date)) {
    return { label: 'Due Tomorrow', color: 'text-accent', icon: Clock };
  }
  return { label: `Due ${formatDistanceToNow(date, { addSuffix: true })}`, color: 'text-muted', icon: Clock };
}

export function TaskCard({ task, onEdit, onDelete, onToggleStatus }: TaskCardProps) {
  const deadlineInfo = getDeadlineInfo(task.deadline);
  const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig[1];
  const statusInfo = statusConfig[task.status];

  const handleToggleStatus = () => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    onToggleStatus(task.id, nextStatus);
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      task.status === 'done' && 'opacity-75'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <h3 className={cn(
              'font-semibold text-base leading-tight',
              task.status === 'done' && 'line-through text-muted'
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={handleToggleStatus}
          >
            <Check className={cn(
              'h-4 w-4',
              task.status === 'done' ? 'text-success' : 'text-muted'
            )} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge className={priorityInfo.color}>
            {priorityInfo.label}
          </Badge>
          <Badge className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {deadlineInfo && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', deadlineInfo.color)}>
            <deadlineInfo.icon className="h-3 w-3" />
            {deadlineInfo.label}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <span className="text-xs text-muted">
            Updated {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => onEdit(task)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-error hover:text-error"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

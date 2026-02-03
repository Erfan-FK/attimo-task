'use client';

import { AppShell } from '@/components/app-shell/app-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TasksPage() {
  const handleNewTask = () => {
    toast.success('New task feature coming soon!');
  };

  return (
    <AppShell
      title="Tasks"
      action={{
        label: 'New Task',
        onClick: handleNewTask,
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            All
          </Button>
          <Button variant="ghost" size="sm">
            Active
          </Button>
          <Button variant="ghost" size="sm">
            Completed
          </Button>
        </div>

        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                />
                <div className="flex-1">
                  <p className="font-medium">Task {i} - Sample task item</p>
                  <p className="text-sm text-muted">Due in {i} days</p>
                </div>
                <Badge variant={i % 2 === 0 ? 'default' : 'warning'}>
                  {i % 2 === 0 ? 'High' : 'Medium'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <EmptyState
          icon={<CheckSquare className="h-6 w-6" />}
          title="No more tasks"
          description="You're all caught up! Create a new task to get started."
          action={
            <Button onClick={handleNewTask}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          }
        />
      </div>
    </AppShell>
  );
}

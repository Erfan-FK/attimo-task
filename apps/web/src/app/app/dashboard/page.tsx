'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle, Clock, ListTodo, FileText, TrendingUp } from 'lucide-react';
import { notesApi, tasksApi, Note, Task } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalNotes: number;
  recentTasks: Task[];
  recentNotes: Note[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch tasks and notes in parallel
      const [tasksResponse, notesResponse] = await Promise.all([
        tasksApi.getAll({}),
        notesApi.getAll({}),
      ]);

      const tasks = tasksResponse.data.tasks;
      const notes = notesResponse.data.notes;

      // Calculate stats
      const completedTasks = tasks.filter((t) => t.status === 'done').length;
      const pendingTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress').length;

      // Get recent items (last 5)
      const recentTasks = tasks.slice(0, 5);
      const recentNotes = notes.slice(0, 5);

      setStats({
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        totalNotes: notes.length,
        recentTasks,
        recentNotes,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completionRate = stats
    ? stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0
    : 0;

  return (
    <AppShell title="Dashboard">
      <div className="h-full grid grid-rows-[auto_1fr] gap-4 overflow-hidden">
        {/* Stats Cards - Fixed at top */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <ListTodo className="h-4 w-4 text-muted" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalTasks || 0}</div>
                  <p className="text-xs text-muted">
                    {stats?.pendingTasks || 0} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.completedTasks || 0}</div>
                  <p className="text-xs text-muted">
                    {completionRate}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                  <FileText className="h-4 w-4 text-muted" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalNotes || 0}</div>
                  <p className="text-xs text-muted">
                    Knowledge base
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productivity</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                  <p className="text-xs text-muted">
                    Task completion
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent Activity - Takes remaining space */}
        <div className="grid gap-4 md:grid-cols-2 min-h-0">
          {/* Recent Tasks */}
          <Card className="flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5" />
                Recent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              ) : stats?.recentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Circle className="h-12 w-12 text-muted mb-3" />
                  <p className="text-sm text-muted">No tasks yet</p>
                  <Link href="/app/tasks" className="text-sm text-accent hover:underline mt-2">
                    Create your first task
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.recentTasks.map((task) => (
                    <Link
                      key={task.id}
                      href="/app/tasks"
                      className="block p-3 rounded-lg border border-border hover:bg-surface2 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {task.status === 'done' ? (
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted">
                            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card className="flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                Recent Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              ) : stats?.recentNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted mb-3" />
                  <p className="text-sm text-muted">No notes yet</p>
                  <Link href="/app/notes" className="text-sm text-accent hover:underline mt-2">
                    Create your first note
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.recentNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/app/notes?note=${note.id}`}
                      className="block p-3 rounded-lg border border-border hover:bg-surface2 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium truncate">{note.title}</p>
                        <p className="text-xs text-muted line-clamp-2">{note.content}</p>
                        <p className="text-xs text-muted">
                          {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

import * as React from 'react';
import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/page-transition';
import { Topbar } from './topbar';

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AppShell({ children, title, action }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-64">
        <Topbar title={title} action={action} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

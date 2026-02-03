'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

interface TopbarProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 px-6">
      <div className="flex flex-1 items-center gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        {action && (
          <Button onClick={action.onClick} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CustomSelect,
  CustomSelectTrigger,
  CustomSelectContent,
  CustomSelectItem,
  CustomSelectValue,
} from '@/components/ui/custom-select';
import { Sparkles, Copy, Check, Loader2, ChevronDown, ChevronUp, Clock, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase/client';

interface AIToolsPanelProps {
  noteId: string;
  onCreateTasks?: (actionItems: string[]) => Promise<void>;
}

interface AIRun {
  id: string;
  action: string;
  output: string;
  created_at: string;
}

const actionOptions = [
  { value: 'summarize', label: '📝 Summarize', description: 'Get key points and takeaways' },
  { value: 'improve', label: '✨ Improve', description: 'Improve grammar and clarity' },
  { value: 'extract_tasks', label: '✅ Extract Tasks', description: 'Extract tasks from note' },
];

export function AIToolsPanel({ noteId, onCreateTasks }: AIToolsPanelProps) {
  const [selectedAction, setSelectedAction] = useState('summarize');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [aiHistory, setAiHistory] = useState<AIRun[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setOutput('');
      setActionItems([]);

      // Get token from Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        toast.error('Session expired. Please log in again.');
        // Redirect to login
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch(`http://localhost:4000/api/notes/${noteId}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: selectedAction }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          toast.error('Session expired. Redirecting to login...');
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 1500);
          return;
        }
        
        // Show user-friendly error message from backend
        const errorMessage = data.error?.message || data.message || 'AI generation failed';
        toast.error(errorMessage, { duration: 5000 });
        return;
      }

      setOutput(data.data.output);
      if (data.data.actionItems) {
        setActionItems(data.data.actionItems);
      }

      toast.success('AI content generated successfully!');
    } catch (error: any) {
      // Show user-friendly error message
      const errorMsg = error.message || 'Failed to generate AI content. Please try again.';
      toast.error(errorMsg, { duration: 5000 });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const loadHistory = async () => {
    if (aiHistory.length > 0) {
      setIsHistoryOpen(!isHistoryOpen);
      return;
    }

    try {
      setIsLoadingHistory(true);
      
      // Get token from Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch(`http://localhost:4000/api/notes/${noteId}/ai-history`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setAiHistory(data.data.aiRuns);
        setIsHistoryOpen(true);
      }
    } catch (error) {
      toast.error('Failed to load AI history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCreateTasks = async () => {
    if (!onCreateTasks || actionItems.length === 0) return;

    try {
      setIsCreatingTasks(true);
      await onCreateTasks(actionItems);
      toast.success(`Created ${actionItems.length} tasks successfully!`);
    } catch (error) {
      toast.error('Failed to create tasks');
    } finally {
      setIsCreatingTasks(false);
    }
  };

  const selectedActionInfo = actionOptions.find(opt => opt.value === selectedAction);

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-surface to-surface2 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* Action Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Choose AI Action</label>
          <CustomSelect value={selectedAction} onValueChange={setSelectedAction}>
            <CustomSelectTrigger>
              <CustomSelectValue />
            </CustomSelectTrigger>
            <CustomSelectContent>
              {actionOptions.map((option) => (
                <CustomSelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted">{option.description}</span>
                  </div>
                </CustomSelectItem>
              ))}
            </CustomSelectContent>
          </CustomSelect>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-accent hover:bg-accent/90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate {selectedActionInfo?.label.split(' ')[1]}
            </>
          )}
        </Button>

        {/* Output Display */}
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Result</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-border text-sm whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar">
              {output}
            </div>
          </div>
        )}

        {/* Action Items List */}
        {actionItems.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Extracted Tasks</label>
            <div className="space-y-2">
              {actionItems.map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-surface border border-border">
                  <ListTodo className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={handleCreateTasks}
              disabled={isCreatingTasks}
              variant="outline"
              className="w-full"
            >
              {isCreatingTasks ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Tasks...
                </>
              ) : (
                <>
                  <ListTodo className="h-4 w-4 mr-2" />
                  Create {actionItems.length} Tasks
                </>
              )}
            </Button>
          </div>
        )}

        {/* AI History */}
        <div className="border-t border-border pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadHistory}
            disabled={isLoadingHistory}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              AI History
            </span>
            {isLoadingHistory ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isHistoryOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {isHistoryOpen && (
            <div className="mt-3 space-y-2">
              {aiHistory.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">No AI history yet</p>
              ) : (
                aiHistory.map((run) => (
                  <button
                    key={run.id}
                    onClick={() => setOutput(run.output)}
                    className={cn(
                      'w-full text-left p-2 rounded-lg border border-border hover:bg-surface2 transition-colors',
                      output === run.output && 'bg-surface2 border-accent'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {actionOptions.find(opt => opt.value === run.action)?.label || run.action}
                      </span>
                      <span className="text-xs text-muted">
                        {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

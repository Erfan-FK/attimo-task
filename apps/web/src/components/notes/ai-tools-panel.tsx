'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CustomSelect,
  CustomSelectTrigger,
  CustomSelectContent,
  CustomSelectItem,
  CustomSelectValue,
} from '@/components/ui/custom-select';
import { Sparkles, Copy, Check, Loader2, Clock, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase/client';

interface AIToolsPanelProps {
  noteId: string;
  noteTitle?: string;
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

export function AIToolsPanel({ noteId, noteTitle, onCreateTasks }: AIToolsPanelProps) {
  const [selectedAction, setSelectedAction] = useState('summarize');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [aiHistory, setAiHistory] = useState<AIRun[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);

  // Reset state when note changes and load history
  useEffect(() => {
    setOutput('');
    setActionItems([]);
    setAiHistory([]);
    setSelectedAction('summarize');
    loadHistory();
  }, [noteId]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setOutput('');
      setActionItems([]);

      // Get the note content from Supabase
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select('content')
        .eq('id', noteId)
        .single();

      if (noteError || !note) {
        toast.error('Failed to load note content. Please try again.');
        return;
      }

      // Validate content is not empty
      if (!note.content || note.content.trim().length === 0) {
        toast.error('Note content is empty. Please add some content before using AI features.');
        return;
      }

      // Validate content length (max 10,000 characters)
      const MAX_CONTENT_LENGTH = 10000;
      if (note.content.length > MAX_CONTENT_LENGTH) {
        toast.error(`Note is too long (${note.content.length} characters). Maximum allowed is ${MAX_CONTENT_LENGTH} characters. Please shorten your note.`);
        return;
      }

      // Validate minimum content length for meaningful AI processing
      if (note.content.trim().length < 20) {
        toast.error('Note content is too short. Please add at least 20 characters for AI to process.');
        return;
      }

      // Get token from Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        toast.error('Session expired. Please log in again.');
        // Redirect to login
        window.location.href = '/auth/login';
        return;
      }

      // Set up timeout for AI request (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        toast.error('AI request timed out after 30 seconds. Please try again with shorter content.');
      }, 30000);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/notes/${noteId}/ai`, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: selectedAction }),
      });

      // Clear timeout on successful response
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          toast.error('Your session has expired. Please log in again.', { duration: 5000 });
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        if (response.status === 429) {
          toast.error('Too many AI requests. Please wait a few minutes before trying again.', { duration: 7000 });
          return;
        }

        if (response.status === 400) {
          const errorMessage = data.error || data.message || 'Invalid request. Please check your note content.';
          toast.error(errorMessage, { duration: 6000 });
          return;
        }
        
        // Show user-friendly error message from backend
        const errorMessage = data.error || data.message || 'AI generation failed. Please try again.';
        toast.error(errorMessage, { duration: 5000 });
        return;
      }

      setOutput(data.data.output);
      if (data.data.actionItems) {
        setActionItems(data.data.actionItems);
      }

      toast.success('AI content generated successfully!');
    } catch (error: any) {
      // Handle different error types
      if (error.name === 'AbortError') {
        // Timeout already handled above
        return;
      }
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error('Network error. Please check your internet connection and try again.', { duration: 5000 });
        return;
      }

      if (error.message?.includes('API key')) {
        toast.error('AI service is not configured. Please contact support.', { duration: 5000 });
        return;
      }
      
      // Generic error with helpful message
      const errorMsg = error.message || 'Failed to generate AI content. Please try again later.';
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
    try {
      setIsLoadingHistory(true);
      
      // Get token from Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        return; // Silently fail for history loading
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/notes/${noteId}/ai-history`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setAiHistory(data.data.aiRuns);
      }
    } catch (error) {
      // Silently fail for history loading
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
      <CardHeader className="pb-3 flex-shrink-0 space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Tools
        </CardTitle>
        {noteTitle && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="truncate">For: <span className="font-medium text-text">{noteTitle}</span></span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* Action Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Choose AI Action</label>
          <CustomSelect value={selectedAction} onValueChange={setSelectedAction}>
            <CustomSelectTrigger className="h-auto min-h-[2.5rem]">
              <div className="flex flex-col items-start py-1">
                <span className="font-medium">{actionOptions.find(opt => opt.value === selectedAction)?.label}</span>
                <span className="text-xs text-muted">{actionOptions.find(opt => opt.value === selectedAction)?.description}</span>
              </div>
            </CustomSelectTrigger>
            <CustomSelectContent>
              {actionOptions.map((option) => (
                <CustomSelectItem key={option.value} value={option.value} className="h-auto py-2">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted leading-tight">{option.description}</span>
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

        {/* AI History - Always Visible */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted" />
              <span className="text-sm font-medium">AI History</span>
            </div>
            {isLoadingHistory && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {aiHistory.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">No AI history for this note yet</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted px-1">Recent AI actions for this note:</p>
                  {aiHistory.map((run) => (
                    <button
                      key={run.id}
                      onClick={() => {
                        setOutput(run.output);
                        
                        // If it's extract_tasks, try to parse and show action items
                        if (run.action === 'extract_tasks') {
                          try {
                            // Try to parse as JSON array first
                            const jsonMatch = run.output.match(/\[[\s\S]*\]/);
                            if (jsonMatch) {
                              const parsed = JSON.parse(jsonMatch[0]);
                              if (Array.isArray(parsed)) {
                                setActionItems(parsed.filter(item => typeof item === 'string' && item.trim().length > 0));
                                return;
                              }
                            }
                            
                            // Fallback: split by newlines
                            const lines = run.output.split('\n')
                              .map(l => l.trim())
                              .filter(l => l.length > 0 && !l.startsWith('[') && !l.startsWith(']'));
                            if (lines.length > 0) {
                              setActionItems(lines);
                            }
                          } catch (e) {
                            // Ignore parsing errors for history
                            setActionItems([]);
                          }
                        } else {
                          // Clear action items for non-extract_tasks actions
                          setActionItems([]);
                        }
                      }}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border border-border hover:bg-surface2 transition-colors',
                        output === run.output && 'bg-surface2 border-accent ring-1 ring-accent/20'
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium flex items-center gap-1.5">
                            {run.action === 'summarize' && '📝'}
                            {run.action === 'improve' && '✨'}
                            {run.action === 'extract_tasks' && '✅'}
                            {actionOptions.find(opt => opt.value === run.action)?.label.replace(/^[^\s]+\s/, '') || run.action}
                          </span>
                          <span className="text-xs text-muted whitespace-nowrap">
                            {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted line-clamp-2">
                          {run.output.substring(0, 80)}...
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { z } from 'zod';

// Common validators
export const uuidSchema = z.string().uuid();
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Task validators
export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'archived']).default('todo'),
  priority: z.number().int().min(1).max(5).default(2),
  deadline: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdSchema = z.object({
  id: uuidSchema,
});

// Note validators
export const createNoteSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  pinned: z.boolean().default(false),
});

export const updateNoteSchema = createNoteSchema.partial();

export const noteIdSchema = z.object({
  id: uuidSchema,
});

export const searchNotesSchema = z.object({
  query: z.string().min(1),
});

// AI validators
export const aiActionSchema = z.object({
  action: z.enum(['summarize', 'expand', 'improve', 'translate', 'extract_tasks', 'custom']),
  customPrompt: z.string().optional(),
});

// Profile validators
export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

// Type exports
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type SearchNotesInput = z.infer<typeof searchNotesSchema>;
export type AiActionInput = z.infer<typeof aiActionSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

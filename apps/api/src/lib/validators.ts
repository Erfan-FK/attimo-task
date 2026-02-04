import { z } from 'zod';

// Common validators
export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Task validators
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'archived']).default('todo'),
  priority: z.number().int().min(1).max(5).default(2),
  deadline: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done', 'archived']).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  deadline: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const taskIdSchema = z.object({
  id: uuidSchema,
});

export const taskQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'archived']).optional(),
  priority: z.coerce.number().int().min(1).max(5).optional(),
  sort: z.enum(['created_desc', 'created_asc', 'deadline_asc', 'deadline_desc', 'priority_desc', 'priority_asc']).default('created_desc'),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Note validators
export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  content: z.string().default(''),
  tags: z.array(z.string()).default([]),
  pinned: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
});

export const noteIdSchema = z.object({
  id: uuidSchema,
});

export const noteQuerySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  pinned: z.coerce.boolean().optional(),
  sort: z.enum(['updated_desc', 'updated_asc', 'created_desc', 'created_asc', 'title_asc', 'title_desc']).default('updated_desc'),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
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
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NoteQueryInput = z.infer<typeof noteQuerySchema>;
export type AiActionInput = z.infer<typeof aiActionSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

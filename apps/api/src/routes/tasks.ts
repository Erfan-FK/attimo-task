import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthRequest, authenticateUser } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { createLimiter } from '../middleware/rate-limit';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  taskQuerySchema,
} from '../lib/validators';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

/**
 * @route GET /api/tasks
 * @desc Get all tasks for the authenticated user with search, filters, sorting, and pagination
 * @access Private
 * @query q - Search query for title/description (case-insensitive)
 * @query status - Filter by status (todo, in_progress, done, archived)
 * @query priority - Filter by priority (1-5)
 * @query sort - Sort order (created_desc, created_asc, deadline_asc, deadline_desc, priority_desc, priority_asc)
 * @query limit - Number of results per page (default: 20, max: 100)
 * @query offset - Number of results to skip (default: 0)
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { q, status, priority, sort, limit, offset } = taskQuerySchema.parse(req.query);

    // Start building the query
    let query = supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId!);

    // Apply search filter (ILIKE for case-insensitive search)
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply priority filter
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Apply sorting
    switch (sort) {
      case 'created_desc':
        query = query.order('created_at', { ascending: false });
        break;
      case 'created_asc':
        query = query.order('created_at', { ascending: true });
        break;
      case 'deadline_asc':
        query = query.order('deadline', { ascending: true, nullsFirst: false });
        break;
      case 'deadline_desc':
        query = query.order('deadline', { ascending: false, nullsFirst: false });
        break;
      case 'priority_desc':
        query = query.order('priority', { ascending: false });
        break;
      case 'priority_asc':
        query = query.order('priority', { ascending: true });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: {
        tasks: data || [],
        pagination: {
          limit,
          offset,
          total: count || 0,
          hasMore: (count || 0) > offset + limit,
        },
        filters: {
          q: q || null,
          status: status || null,
          priority: priority || null,
          sort,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/tasks/:id
 * @desc Get a single task by ID
 * @access Private
 */
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = taskIdSchema.parse(req.params);

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new AppError('Task not found', 'TASK_NOT_FOUND', 404);
    }

    res.json({
      success: true,
      data: {
        task: data,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/tasks
 * @desc Create a new task
 * @access Private
 */
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const taskData = createTaskSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        ...taskData,
        user_id: req.userId!,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: {
        task: data,
      },
      message: 'Task created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/tasks/:id
 * @desc Update a task (partial update)
 * @access Private
 */
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = taskIdSchema.parse(req.params);
    const updates = updateTaskSchema.parse(req.body);

    // Check if task exists and belongs to user
    const { data: existingTask } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .maybeSingle();

    if (!existingTask) {
      throw new AppError('Task not found', 'TASK_NOT_FOUND', 404);
    }

    // Update the task
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        task: data,
      },
      message: 'Task updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/tasks/:id
 * @desc Delete a task
 * @access Private
 */
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = taskIdSchema.parse(req.params);

    // Check if task exists and belongs to user before deleting
    const { data: existingTask } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .maybeSingle();

    if (!existingTask) {
      throw new AppError('Task not found', 'TASK_NOT_FOUND', 404);
    }

    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId!);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

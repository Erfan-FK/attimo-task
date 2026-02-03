import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthRequest, authenticateUser } from '../middleware/auth';
import { AppError } from '../middleware/error';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  paginationSchema,
} from '../lib/validators';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

/**
 * @route GET /api/tasks
 * @desc Get all tasks for the authenticated user
 * @access Private
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      tasks: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
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
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new AppError('Task not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    res.json({ task: data });
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

    res.status(201).json({ task: data });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/tasks/:id
 * @desc Update a task
 * @access Private
 */
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = taskIdSchema.parse(req.params);
    const updates = updateTaskSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new AppError('Task not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    res.json({ task: data });
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

    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId!);

    if (error) throw error;

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

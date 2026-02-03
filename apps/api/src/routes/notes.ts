import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthRequest, authenticateUser } from '../middleware/auth';
import { AppError } from '../middleware/error';
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
  searchNotesSchema,
  paginationSchema,
} from '../lib/validators';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

/**
 * @route GET /api/notes
 * @desc Get all notes for the authenticated user
 * @access Private
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from('notes')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId!)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      notes: data,
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
 * @route GET /api/notes/:id
 * @desc Get a single note by ID
 * @access Private
 */
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = noteIdSchema.parse(req.params);

    const { data, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new AppError('Note not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    res.json({ note: data });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/notes
 * @desc Create a new note
 * @access Private
 */
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const noteData = createNoteSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('notes')
      .insert({
        ...noteData,
        user_id: req.userId!,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ note: data });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/notes/:id
 * @desc Update a note
 * @access Private
 */
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = noteIdSchema.parse(req.params);
    const updates = updateNoteSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('notes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new AppError('Note not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    res.json({ note: data });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/notes/:id
 * @desc Delete a note
 * @access Private
 */
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = noteIdSchema.parse(req.params);

    const { error } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId!);

    if (error) throw error;

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/notes/search
 * @desc Search notes using full-text search
 * @access Private
 */
router.post('/search', async (req: AuthRequest, res, next) => {
  try {
    const { query } = searchNotesSchema.parse(req.body);

    const { data, error } = await supabaseAdmin.rpc('search_notes', {
      search_query: query,
      user_uuid: req.userId!,
    });

    if (error) throw error;

    res.json({ notes: data });
  } catch (error) {
    next(error);
  }
});

export default router;

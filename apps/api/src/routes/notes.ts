import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthRequest, authenticateUser } from '../middleware/auth';
import { AppError } from '../middleware/error';
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
  noteQuerySchema,
} from '../lib/validators';
import { z } from 'zod';
import { generateAIResponse, parseActionItems, AIAction } from '../lib/ai';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

/**
 * @route GET /api/notes
 * @desc Get all notes for the authenticated user with search, filters, sorting, and pagination
 * @access Private
 * @query q - Search query for title/content (case-insensitive)
 * @query tag - Filter by tag (notes containing this tag)
 * @query pinned - Filter by pinned status (true/false)
 * @query sort - Sort order (updated_desc, updated_asc, created_desc, created_asc, title_asc, title_desc)
 * @query limit - Number of results per page (default: 20, max: 100)
 * @query offset - Number of results to skip (default: 0)
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { q, tag, pinned, sort, limit, offset } = noteQuerySchema.parse(req.query);

    // Start building the query
    let query = supabaseAdmin
      .from('notes')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId!);

    // Apply search filter (ILIKE for case-insensitive search)
    if (q) {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }

    // Apply tag filter (check if tags array contains the tag)
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // Apply pinned filter
    if (pinned !== undefined) {
      query = query.eq('pinned', pinned);
    }

    // Apply sorting
    switch (sort) {
      case 'updated_desc':
        query = query.order('updated_at', { ascending: false });
        break;
      case 'updated_asc':
        query = query.order('updated_at', { ascending: true });
        break;
      case 'created_desc':
        query = query.order('created_at', { ascending: false });
        break;
      case 'created_asc':
        query = query.order('created_at', { ascending: true });
        break;
      case 'title_asc':
        query = query.order('title', { ascending: true });
        break;
      case 'title_desc':
        query = query.order('title', { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: {
        notes: data || [],
        pagination: {
          limit,
          offset,
          total: count || 0,
          hasMore: (count || 0) > offset + limit,
        },
        filters: {
          q: q || null,
          tag: tag || null,
          pinned: pinned !== undefined ? pinned : null,
          sort,
        },
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
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new AppError('Note not found', 'NOTE_NOT_FOUND', 404);
    }

    res.json({
      success: true,
      data: {
        note: data,
      },
    });
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

    res.status(201).json({
      success: true,
      data: {
        note: data,
      },
      message: 'Note created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/notes/:id
 * @desc Update a note (partial update)
 * @access Private
 */
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = noteIdSchema.parse(req.params);
    const updates = updateNoteSchema.parse(req.body);

    // Check if note exists and belongs to user
    const { data: existingNote } = await supabaseAdmin
      .from('notes')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .maybeSingle();

    if (!existingNote) {
      throw new AppError('Note not found', 'NOTE_NOT_FOUND', 404);
    }

    // Update the note
    const { data, error } = await supabaseAdmin
      .from('notes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        note: data,
      },
      message: 'Note updated successfully',
    });
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

    // Check if note exists and belongs to user before deleting
    const { data: existingNote } = await supabaseAdmin
      .from('notes')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .maybeSingle();

    if (!existingNote) {
      throw new AppError('Note not found', 'NOTE_NOT_FOUND', 404);
    }

    const { error } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId!);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/notes/:id/ai
 * @desc Generate AI content for a note
 * @access Private
 */
router.post('/:id/ai', async (req: AuthRequest, res, next) => {
  try {
    const { id } = noteIdSchema.parse(req.params);
    const { action } = z.object({
      action: z.enum(['summarize', 'improve', 'extract_tasks']),
    }).parse(req.body);

    // Fetch note and verify ownership
    const { data: note, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .single();

    if (fetchError || !note) {
      throw new AppError('Note not found', 'NOT_FOUND', 404);
    }

    // Check if note has content
    if (!note.content || note.content.trim().length === 0) {
      throw new AppError('Note content is empty. Please add content before using AI features.', 'VALIDATION_ERROR', 400);
    }

    // Generate AI response
    const output = await generateAIResponse(action as AIAction, note.content);

    // Parse action items if needed
    let actionItems: string[] | undefined;
    if (action === 'extract_tasks') {
      try {
        actionItems = parseActionItems(output);
      } catch (parseError: any) {
        // Return user-friendly error for task extraction failures
        throw new AppError(parseError.message || 'Failed to extract tasks from note', 'AI_ERROR', 400);
      }
    }

    // Save AI run to database
    const { data: aiRun, error: insertError } = await supabaseAdmin
      .from('note_ai_runs')
      .insert({
        user_id: req.userId!,
        note_id: id,
        action,
        output,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.json({
      success: true,
      data: {
        output,
        aiRunId: aiRun.id,
        actionItems,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/notes/:id/ai-history
 * @desc Get AI history for a note
 * @access Private
 */
router.get('/:id/ai-history', async (req: AuthRequest, res, next) => {
  try {
    const { id } = noteIdSchema.parse(req.params);

    // Verify note ownership
    const { data: note, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .single();

    if (fetchError || !note) {
      throw new AppError('Note not found', 'NOT_FOUND', 404);
    }

    // Fetch last 5 AI runs
    const { data: aiRuns, error } = await supabaseAdmin
      .from('note_ai_runs')
      .select('*')
      .eq('note_id', id)
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        aiRuns: aiRuns || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

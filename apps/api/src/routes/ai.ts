import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthRequest, authenticateUser } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { aiActionSchema, noteIdSchema } from '../lib/validators';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

/**
 * @route POST /api/ai/notes/:id
 * @desc Run AI action on a note
 * @access Private
 */
router.post('/notes/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = noteIdSchema.parse(req.params);
    const { action, customPrompt } = aiActionSchema.parse(req.body);

    // First, verify the note belongs to the user
    const { data: note, error: noteError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .single();

    if (noteError) {
      if (noteError.code === 'PGRST116') {
        throw new AppError('Note not found', 'NOT_FOUND', 404);
      }
      throw noteError;
    }

    // TODO: Implement AI processing logic here
    // For now, return a placeholder response
    let output = '';
    
    switch (action) {
      case 'summarize':
        output = `Summary of "${note.title}": This is a placeholder summary. Integrate with OpenAI or Groq API to generate actual summaries.`;
        break;
      case 'expand':
        output = `Expanded version of "${note.title}": This is a placeholder expansion. Integrate with AI API to generate actual expansions.`;
        break;
      case 'improve':
        output = `Improved version of "${note.title}": This is a placeholder improvement. Integrate with AI API to generate actual improvements.`;
        break;
      case 'translate':
        output = `Translated version of "${note.title}": This is a placeholder translation. Integrate with AI API to generate actual translations.`;
        break;
      case 'extract_tasks':
        output = `Tasks extracted from "${note.title}":\n- Task 1 (placeholder)\n- Task 2 (placeholder)\nIntegrate with AI API to extract actual tasks.`;
        break;
      case 'custom':
        output = `Custom action result for "${note.title}" with prompt: "${customPrompt}". This is a placeholder. Integrate with AI API for actual results.`;
        break;
    }

    // Save AI run to database
    const { data: aiRun, error: aiError } = await supabaseAdmin
      .from('note_ai_runs')
      .insert({
        user_id: req.userId!,
        note_id: id,
        action,
        output,
      })
      .select()
      .single();

    if (aiError) throw aiError;

    res.json({
      aiRun,
      message: 'AI action completed successfully. Note: This is a placeholder implementation.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/ai/notes/:id/runs
 * @desc Get AI run history for a note
 * @access Private
 */
router.get('/notes/:id/runs', async (req: AuthRequest, res, next) => {
  try {
    const { id } = noteIdSchema.parse(req.params);

    // Verify note belongs to user
    const { data: note, error: noteError } = await supabaseAdmin
      .from('notes')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .single();

    if (noteError) {
      if (noteError.code === 'PGRST116') {
        throw new AppError('Note not found', 'NOT_FOUND', 404);
      }
      throw noteError;
    }

    const { data, error } = await supabaseAdmin
      .from('note_ai_runs')
      .select('*')
      .eq('note_id', id)
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ aiRuns: data });
  } catch (error) {
    next(error);
  }
});

export default router;

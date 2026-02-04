import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthRequest, authenticateUser } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

/**
 * @route GET /api/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.userId!)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/profile
 * @desc Update user profile
 * @access Private
 */
router.patch('/', async (req: AuthRequest, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.userId!)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

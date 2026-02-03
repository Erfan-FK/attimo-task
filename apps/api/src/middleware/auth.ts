import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { AppError } from './error';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

interface SupabaseJWTPayload extends JWTPayload {
  sub: string;
  email?: string;
  role?: string;
}

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is required');
}

// Create JWKS endpoint URL
const jwksUrl = new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);

// Create remote JWK Set for JWT verification
const JWKS = createRemoteJWKSet(jwksUrl);

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid authorization header', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT using JWKS
    const { payload } = await jwtVerify<SupabaseJWTPayload>(token, JWKS, {
      issuer: `${supabaseUrl}/auth/v1`,
      audience: 'authenticated',
    });

    if (!payload.sub) {
      throw new AppError('Invalid token payload', 'INVALID_TOKEN', 401);
    }

    // Attach user info to request
    req.userId = payload.sub;
    req.userEmail = payload.email;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 'INVALID_TOKEN', 401));
    }
  }
};

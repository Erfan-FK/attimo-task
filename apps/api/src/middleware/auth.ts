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
      throw new AppError(
        'Missing or invalid authorization header. Please provide a valid Bearer token.',
        'UNAUTHORIZED',
        401
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT using JWKS
    const { payload } = await jwtVerify<SupabaseJWTPayload>(token, JWKS, {
      issuer: `${supabaseUrl}/auth/v1`,
      audience: 'authenticated',
    });

    if (!payload.sub) {
      throw new AppError('Invalid token payload - missing user ID', 'INVALID_TOKEN', 401);
    }

    // Check token expiration and warn if close to expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp) {
      const timeUntilExpiry = payload.exp - now;
      
      // Token expired
      if (timeUntilExpiry <= 0) {
        throw new AppError('Token has expired. Please refresh your session.', 'TOKEN_EXPIRED', 401);
      }
      
      // Token expires in less than 5 minutes - send warning header
      if (timeUntilExpiry < 300) {
        res.setHeader('X-Token-Refresh-Needed', 'true');
        res.setHeader('X-Token-Expires-In', timeUntilExpiry.toString());
      }
    }

    // Attach user info to request
    req.userId = payload.sub;
    req.userEmail = payload.email;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('expired')) {
        next(new AppError('Your session has expired. Please log in again.', 'TOKEN_EXPIRED', 401));
      } else if (errorMessage.includes('signature')) {
        next(new AppError('Invalid token signature. Please log in again.', 'INVALID_SIGNATURE', 401));
      } else {
        next(new AppError('Authentication failed. Please log in again.', 'INVALID_TOKEN', 401));
      }
    }
  }
};

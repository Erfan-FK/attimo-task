import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Custom app errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  // JWT errors
  if (err.name === 'JWTExpired' || err.name === 'JWSSignatureVerificationFailed') {
    res.status(401).json({
      error: {
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      },
    });
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Generic error response
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
    },
  });
};

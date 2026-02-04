import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP address. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP address. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    error: 'Too many authentication attempts. Please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes',
    });
  },
});

/**
 * AI endpoint rate limiter
 * Limits: 20 requests per 15 minutes per IP (AI operations are expensive)
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 AI requests per windowMs
  message: {
    error: 'Too many AI requests. Please try again later.',
    code: 'AI_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many AI requests from this IP. AI operations are resource-intensive. Please try again in 15 minutes.',
      code: 'AI_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes',
    });
  },
});

/**
 * Strict rate limiter for creating resources
 * Limits: 30 requests per 15 minutes per IP
 */
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 create operations per windowMs
  message: {
    error: 'Too many create requests. Please try again later.',
    code: 'CREATE_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many create requests from this IP. Please slow down.',
      code: 'CREATE_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes',
    });
  },
});

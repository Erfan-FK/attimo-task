import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';

// Try to find .env file - check both monorepo root and api directory
const possibleEnvPaths = [
  path.join(process.cwd(), '.env'),                    // When running from api directory
  path.join(process.cwd(), 'apps', 'api', '.env'),     // When running from monorepo root
  path.join(__dirname, '..', '..', '.env'),            // Relative to dist/src/config
];

const envPath = possibleEnvPaths.find(p => existsSync(p));

if (envPath) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded .env from:', envPath);
} else {
  console.warn('⚠️ No .env file found. Checked:', possibleEnvPaths);
}

// Log to verify env vars are loaded
console.log('🔧 Environment check:', {
  cwd: process.cwd(),
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.SUPABASE_URL?.substring(0, 40) + '...',
});

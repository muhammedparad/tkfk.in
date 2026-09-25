import 'server-only';
import { createClient } from '@supabase/supabase-js';

const dataMode = process.env.DATA_MODE || 'mock';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Check if the application is running under Supabase database mode.
 * Throws explicit error in production if DATA_MODE is not set to 'supabase'.
 */
export function isSupabaseMode(): boolean {
  if (process.env.NODE_ENV === 'production' && dataMode !== 'supabase') {
    throw new Error(
      "[SECURITY CONFIGURATION ERROR] Production mode explicitly requires DATA_MODE=supabase! Fallback to mock mode is strictly prohibited in production."
    );
  }
  return dataMode === 'supabase';
}

export function validateDatabaseConfig(): void {
  if (process.env.NODE_ENV === 'production' && dataMode !== 'supabase') {
    throw new Error(
      "[SECURITY CONFIGURATION ERROR] Production mode explicitly requires DATA_MODE=supabase! Fallback to mock mode is strictly prohibited in production."
    );
  }
  if (dataMode === 'supabase') {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        `[CRITICAL DATABASE CONFIGURATION ERROR] DATA_MODE is set to 'supabase', but NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing! Production requires a valid Supabase database setup.`
      );
    }
    if (!supabaseServiceKey) {
      throw new Error(
        `[CRITICAL DATABASE CONFIGURATION ERROR] DATA_MODE is set to 'supabase', but SUPABASE_SERVICE_ROLE_KEY is missing! Privileged server operations require a valid service-role secret.`
      );
    }
  }
}

// Client for Browser / Public operations
export const supabaseClient = (() => {
  if (dataMode === 'supabase') {
    validateDatabaseConfig();
    return createClient(supabaseUrl!, supabaseAnonKey!);
  }
  return null;
})();

// Client for Server-side Admin / Service operations
export const supabaseAdmin = (() => {
  if (dataMode === 'supabase') {
    validateDatabaseConfig();
    if (!supabaseServiceKey) {
      throw new Error(
        `[CRITICAL SECURITY ERROR] DATA_MODE is set to 'supabase', but SUPABASE_SERVICE_ROLE_KEY is missing! Privileged admin client cannot fall back to anonymous credentials.`
      );
    }
    return createClient(supabaseUrl!, supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }
  return null;
})();

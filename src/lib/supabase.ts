import 'server-only';
import { createClient } from '@supabase/supabase-js';

const rawDataMode = process.env.DATA_MODE?.toLowerCase();
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ckupfbdoedhidncbwmfc.supabase.co';
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdXBmYmRvZWRoaWRuY2J3bWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODI3NjQsImV4cCI6MjEwNTc1ODc2NH0.QtjTE5ay-KiTjLqQbrrgm6E3lhUUrG9xTVbjw2BLkXU';
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdXBmYmRvZWRoaWRuY2J3bWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE4Mjc2NCwiZXhwIjoyMTA1NzU4NzY0fQ.rZFg0xZyPgLGONn8of16EohvoUavfaQP-YqcWfAj-vw';

const supabaseUrl = rawSupabaseUrl.trim().replace(/^["']|["']$/g, '');
const supabaseAnonKey = rawAnonKey.trim().replace(/^["']|["']$/g, '');
const supabaseServiceKey = rawServiceKey.trim().replace(/^["']|["']$/g, '');

// If explicitly set to 'mock', use mock mode. Otherwise default to 'supabase' whenever keys or production is present.
const dataMode = rawDataMode === 'mock' ? 'mock' : 'supabase';

/**
 * Check if the application is running under Supabase database mode.
 */
export function isSupabaseMode(): boolean {
  if (process.env.NODE_ENV === 'production' && dataMode === 'mock') {
    throw new Error(
      "[SECURITY CONFIGURATION ERROR] Production mode explicitly requires DATA_MODE=supabase! Fallback to mock mode is strictly prohibited in production."
    );
  }
  return dataMode === 'supabase';
}

export function validateDatabaseConfig(): void {
  if (process.env.NODE_ENV === 'production' && dataMode === 'mock') {
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
    return createClient(supabaseUrl, supabaseAnonKey);
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
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }
  return null;
})();

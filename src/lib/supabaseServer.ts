import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export function getSupabaseServerAdminClient() {
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      '[SECURITY CONFIGURATION ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for server database operations. Database connection failed.'
    );
  }
  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });
}

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[CONFIGURATION ERROR] Missing SUPABASE_URL or SUPABASE_ANON_KEY for server operations.'
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

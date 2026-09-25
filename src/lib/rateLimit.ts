import { isSupabaseMode, supabaseAdmin } from '@/lib/supabase';

interface RateLimitEntry {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      entry.timestamps = entry.timestamps.filter(ts => now - ts < 3600000);
      if (entry.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitOptions {
  limit: number;      // Maximum requests allowed in window
  windowMs: number;   // Window duration in milliseconds
}

/**
 * In-memory fallback rate limiter
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60000 }
): { allowed: boolean; current: number; limit: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let entry = memoryStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    memoryStore.set(key, entry);
  }

  // Filter timestamps within current window
  entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

  if (entry.timestamps.length >= options.limit) {
    const oldest = entry.timestamps[0];
    const resetMs = oldest + options.windowMs - now;
    return {
      allowed: false,
      current: entry.timestamps.length,
      limit: options.limit,
      resetMs: resetMs > 0 ? resetMs : options.windowMs,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    current: entry.timestamps.length,
    limit: options.limit,
    resetMs: options.windowMs,
  };
}

/**
 * Distributed persistent rate limiter (Supabase rate_limits table with memory fallback)
 * Rate limits by composite keys (IP + Identifier) across serverless instances (Issue 22)
 */
export async function checkRateLimitAsync(
  key: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60000 }
): Promise<{ allowed: boolean; current: number; limit: number; resetMs: number }> {
  if (isSupabaseMode() && supabaseAdmin) {
    try {
      const now = new Date();
      const windowStartIso = new Date(now.getTime() - options.windowMs).toISOString();

      // Clean up old entries for this key asynchronously
      supabaseAdmin
        .from('rate_limits')
        .delete()
        .eq('key', key)
        .lt('timestamp', windowStartIso)
        .then(() => {}, () => {});

      // Count existing hits in window
      const { count } = await supabaseAdmin
        .from('rate_limits')
        .select('*', { count: 'exact', head: true })
        .eq('key', key)
        .gte('timestamp', windowStartIso);

      const current = count || 0;

      if (current >= options.limit) {
        return {
          allowed: false,
          current,
          limit: options.limit,
          resetMs: options.windowMs,
        };
      }

      // Record new hit
      await supabaseAdmin.from('rate_limits').insert({
        key,
        timestamp: now.toISOString(),
      });

      return {
        allowed: true,
        current: current + 1,
        limit: options.limit,
        resetMs: options.windowMs,
      };
    } catch (err) {
      console.warn('[RATE LIMIT PERSISTENT FALLBACK]', err);
    }
  }

  return checkRateLimit(key, options);
}

/**
 * Extract client IP safely from trusted proxy headers
 */
export function getClientIp(headers: Headers): string {
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp && isValidIp(cfIp.trim())) {
    return cfIp.trim();
  }

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp && isValidIp(xRealIp.trim())) {
    return xRealIp.trim();
  }

  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map(s => s.trim());
    for (let i = ips.length - 1; i >= 0; i--) {
      if (isValidIp(ips[i])) return ips[i];
    }
  }

  return '127.0.0.1';
}

function isValidIp(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

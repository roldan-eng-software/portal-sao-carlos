/**
 * Simple in-memory rate limiter for Fase 2 form submission.
 * Limits by IP address using a sliding window.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 10;

interface RateLimitEntry {
  timestamps: number[];
}

const limiter = new Map<string, RateLimitEntry>();

/**
 * Checks if an IP is within rate limits.
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = limiter.get(ip) || { timestamps: [] };

  // Filter timestamps within the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldest = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldest + WINDOW_MS,
    };
  }

  entry.timestamps.push(now);
  limiter.set(ip, entry);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.timestamps.length,
    resetAt: now + WINDOW_MS,
  };
}

/**
 * Periodically cleanup the map to prevent memory leaks.
 */
export function cleanupRateLimiter() {
  const now = Date.now();
  for (const [ip, entry] of limiter.entries()) {
    const valid = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) {
      limiter.delete(ip);
    } else {
      entry.timestamps = valid;
    }
  }
}
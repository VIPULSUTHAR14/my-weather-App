interface RateLimitRecord {
  timestamps: number[];
}

export class InMemoryRateLimiter {
  private cache = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Limit requests for a given key (e.g. client IP).
   * Returns details of the limit check.
   */
  public limit(key: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or initialize record
    let record = this.cache.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.cache.set(key, record);
    }

    // Filter out old timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((timestamp) => timestamp > windowStart);

    const currentRequests = record.timestamps.length;

    if (currentRequests >= this.maxRequests) {
      // Find oldest timestamp in current window to calculate reset time
      const oldestTimestamp = record.timestamps[0];
      const resetTime = oldestTimestamp + this.windowMs;
      const resetInSeconds = Math.max(0, Math.ceil((resetTime - now) / 1000));

      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: resetInSeconds,
      };
    }

    // Allow request and add timestamp
    record.timestamps.push(now);

    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + this.windowMs;
    const resetInSeconds = Math.max(0, Math.ceil((resetTime - now) / 1000));

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.timestamps.length,
      reset: resetInSeconds,
    };
  }

  /**
   * Remove expired timestamps and delete unused keys to prevent memory leaks.
   */
  public prune(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [key, record] of this.cache.entries()) {
      record.timestamps = record.timestamps.filter((timestamp) => timestamp > windowStart);
      if (record.timestamps.length === 0) {
        this.cache.delete(key);
      }
    }
  }
}

// Read limits from environment variables with safe defaults (10 req/min)
const windowMs = process.env.RATE_LIMIT_WINDOW_MS 
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) 
  : 60000;
const maxRequests = process.env.RATE_LIMIT_MAX 
  ? parseInt(process.env.RATE_LIMIT_MAX, 10) 
  : 10;

export const rateLimiter = new InMemoryRateLimiter(windowMs, maxRequests);

// Prune memory every 5 minutes to prevent memory leak
if (typeof global !== 'undefined') {
  const interval = setInterval(() => {
    rateLimiter.prune();
  }, 5 * 60 * 1000);
  
  if (interval && typeof interval.unref === 'function') {
    interval.unref();
  }
}

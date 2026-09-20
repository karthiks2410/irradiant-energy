/**
 * Token-bucket rate limiting for the lead action.
 *
 * SERVERLESS CAVEAT: the buckets live in the memory of one function instance. On Vercel each
 * instance (and each region) keeps its own counters, and a cold start resets them, so this
 * is a soft brake against naive floods and accidental double submits, not a hard quota. It
 * still bounds the damage of a burst to one instance's budget. For a durable limit, implement
 * `RateLimiter` with Upstash Redis (`@upstash/ratelimit`) or add a Vercel WAF rate-limit rule
 * on POSTs to /get-quote, and pass that limiter to `checkLeadRateLimit` (architecture.md §6.4).
 */

export interface RateLimitDecision {
  allowed: boolean;
  /** Seconds until the next request would be allowed; 0 when allowed. */
  retryAfterSeconds: number;
}

export interface RateLimiter {
  /** Consumes one token for `key`; async so a network-backed store drops in unchanged. */
  limit(key: string): Promise<RateLimitDecision>;
}

export interface TokenBucketOptions {
  /** Burst size: requests allowed back to back from an idle start. */
  capacity: number;
  /** Sustained rate: tokens added per `refillIntervalMs`. */
  refillTokens: number;
  refillIntervalMs: number;
  /** Buckets kept in memory before idle ones are evicted. */
  maxEntries?: number;
  now?: () => number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

export function createTokenBucketLimiter(options: TokenBucketOptions): RateLimiter {
  const { capacity, refillTokens, refillIntervalMs, maxEntries = 10_000, now = Date.now } = options;
  const ratePerMs = refillTokens / refillIntervalMs;
  const buckets = new Map<string, Bucket>();

  const evictIdle = (at: number) => {
    if (buckets.size < maxEntries) return;
    for (const [key, bucket] of buckets) {
      if (bucket.tokens + (at - bucket.updatedAt) * ratePerMs >= capacity) buckets.delete(key);
    }
    // Under a flood of distinct keys, drop the oldest so memory stays bounded.
    while (buckets.size >= maxEntries) {
      const oldest = buckets.keys().next().value;
      if (oldest === undefined) break;
      buckets.delete(oldest);
    }
  };

  return {
    async limit(key) {
      const at = now();
      const bucket = buckets.get(key);
      let tokens = capacity;
      if (bucket) {
        tokens = Math.min(capacity, bucket.tokens + (at - bucket.updatedAt) * ratePerMs);
        buckets.delete(key); // re-insert so Map order stays least-recently-used first
      } else {
        evictIdle(at);
      }
      if (tokens >= 1) {
        buckets.set(key, { tokens: tokens - 1, updatedAt: at });
        return { allowed: true, retryAfterSeconds: 0 };
      }
      buckets.set(key, { tokens, updatedAt: at });
      return { allowed: false, retryAfterSeconds: Math.ceil((1 - tokens) / ratePerMs / 1000) };
    },
  };
}

/** Allows a request only when every limiter allows it; reports the longest wait. */
export function combineLimiters(...limiters: RateLimiter[]): RateLimiter {
  return {
    async limit(key) {
      const decisions = await Promise.all(limiters.map((l) => l.limit(key)));
      const blocked = decisions.filter((d) => !d.allowed);
      if (blocked.length === 0) return { allowed: true, retryAfterSeconds: 0 };
      return { allowed: false, retryAfterSeconds: Math.max(...blocked.map((d) => d.retryAfterSeconds)) };
    },
  };
}

const GLOBAL_KEY = "__all__";

/** Per-IP: 5 submissions at once, then one every 2 minutes. */
const perIp = createTokenBucketLimiter({ capacity: 5, refillTokens: 1, refillIntervalMs: 2 * 60_000 });

/**
 * Whole-instance: 30 leads at once, then one a minute, so a distributed flood cannot burn
 * the Resend daily quota (each lead sends two emails) from a single instance.
 */
const global = createTokenBucketLimiter({ capacity: 30, refillTokens: 1, refillIntervalMs: 60_000 });

const defaultLeadLimiter: RateLimiter = {
  async limit(key) {
    // Sequential, not Promise.all: a request already refused by its own IP bucket must not
    // spend a token from the shared bucket. Charging both let one flooding IP drain the
    // whole-instance budget and block every other visitor on that instance.
    const ip = await perIp.limit(key);
    if (!ip.allowed) return ip;
    const all = await global.limit(GLOBAL_KEY);
    if (!all.allowed) return all;
    return { allowed: true, retryAfterSeconds: 0 };
  },
};

/** Rate-limits one lead submission from `ip`. Swap the limiter here to move to Upstash or a WAF. */
export function checkLeadRateLimit(ip: string, limiter: RateLimiter = defaultLeadLimiter): Promise<RateLimitDecision> {
  return limiter.limit(ip);
}

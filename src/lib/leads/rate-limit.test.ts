import { describe, expect, it } from "vitest";
import { checkLeadRateLimit, combineLimiters, createTokenBucketLimiter } from "./rate-limit";

describe("token bucket", () => {
  it("allows a burst up to capacity, then refills at the sustained rate", async () => {
    let now = 0;
    const limiter = createTokenBucketLimiter({ capacity: 3, refillTokens: 1, refillIntervalMs: 1_000, now: () => now });
    expect((await limiter.limit("a")).allowed).toBe(true);
    expect((await limiter.limit("a")).allowed).toBe(true);
    expect((await limiter.limit("a")).allowed).toBe(true);
    const blocked = await limiter.limit("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
    now = 1_000;
    expect((await limiter.limit("a")).allowed).toBe(true);
    expect((await limiter.limit("a")).allowed).toBe(false);
    now = 10_000;
    for (let i = 0; i < 3; i++) expect((await limiter.limit("a")).allowed).toBe(true);
    expect((await limiter.limit("a")).allowed).toBe(false);
  });

  it("keeps keys independent and bounds memory", async () => {
    const limiter = createTokenBucketLimiter({ capacity: 1, refillTokens: 1, refillIntervalMs: 60_000, maxEntries: 3, now: () => 0 });
    expect((await limiter.limit("a")).allowed).toBe(true);
    expect((await limiter.limit("b")).allowed).toBe(true);
    expect((await limiter.limit("a")).allowed).toBe(false);
    expect((await limiter.limit("c")).allowed).toBe(true);
    // The map is full; a fourth key evicts the least-recently-used one instead of growing.
    expect((await limiter.limit("d")).allowed).toBe(true);
    expect((await limiter.limit("b")).allowed).toBe(true);
  });

  it("combines limiters and reports the longest wait", async () => {
    const fast = createTokenBucketLimiter({ capacity: 1, refillTokens: 1, refillIntervalMs: 1_000, now: () => 0 });
    const slow = createTokenBucketLimiter({ capacity: 1, refillTokens: 1, refillIntervalMs: 30_000, now: () => 0 });
    const both = combineLimiters(fast, slow);
    expect((await both.limit("k")).allowed).toBe(true);
    const blocked = await both.limit("k");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(30);
  });

  it("exposes the lead limiter with a swappable implementation", async () => {
    const always = { limit: async () => ({ allowed: false, retryAfterSeconds: 7 }) };
    expect(await checkLeadRateLimit("203.0.113.1", always)).toEqual({ allowed: false, retryAfterSeconds: 7 });
    expect((await checkLeadRateLimit("203.0.113.2")).allowed).toBe(true);
  });
});

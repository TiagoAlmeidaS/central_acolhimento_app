import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

/**
 * Rate limit com **fallback in-memory** quando `UPSTASH_REDIS_*` está vazio.
 *
 * - Produção: Upstash Redis + `Ratelimit.slidingWindow` (compartilhado entre
 *   instâncias serverless do Next).
 * - Dev/test: implementação in-process, suficiente para um servidor único.
 *
 * Buckets dos auth flows (definidos em `01-auth` §Persistência):
 *  - `sendOtp`:  5 por IP+telefone por 10min
 *  - `verifyOtp`: 10 por telefone por 10min
 */

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export interface RateLimiter {
  limit: (key: string) => Promise<RateLimitResult>;
}

type Bucket = {
  count: number;
  resetAt: number;
};

class InMemoryRateLimit implements RateLimiter {
  private buckets = new Map<string, Bucket>();
  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      const fresh: Bucket = { count: 1, resetAt: now + this.windowMs };
      this.buckets.set(key, fresh);
      return {
        success: true,
        remaining: this.max - 1,
        reset: fresh.resetAt,
      };
    }
    bucket.count += 1;
    const success = bucket.count <= this.max;
    return {
      success,
      remaining: Math.max(0, this.max - bucket.count),
      reset: bucket.resetAt,
    };
  }

  /** Apenas para testes — limpa o estado entre casos. */
  __reset() {
    this.buckets.clear();
  }
}

class UpstashRateLimit implements RateLimiter {
  constructor(private readonly limiter: Ratelimit) {}
  async limit(key: string): Promise<RateLimitResult> {
    const r = await this.limiter.limit(key);
    return {
      success: r.success,
      remaining: r.remaining,
      reset: r.reset,
    };
  }
}

function makeLimiter(prefix: string, max: number, windowMs: number): RateLimiter {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    const windowSeconds = Math.ceil(windowMs / 1000);
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
      analytics: false,
      prefix,
    });
    return new UpstashRateLimit(limiter);
  }
  return new InMemoryRateLimit(max, windowMs);
}

const TEN_MINUTES = 10 * 60 * 1000;

// Cacheia no module-scope para que dev/HMR não resete os buckets toda hora.
declare global {
  // eslint-disable-next-line no-var
  var __rl_send__: RateLimiter | undefined;
  // eslint-disable-next-line no-var
  var __rl_verify__: RateLimiter | undefined;
}

export const sendOtpLimiter: RateLimiter =
  globalThis.__rl_send__ ??
  (globalThis.__rl_send__ = makeLimiter("otp:send", 5, TEN_MINUTES));

export const verifyOtpLimiter: RateLimiter =
  globalThis.__rl_verify__ ??
  (globalThis.__rl_verify__ = makeLimiter("otp:verify", 10, TEN_MINUTES));

/** Helpers para testes — exposto para resetar contadores in-memory. */
export const __testing = {
  createInMemoryLimiter: (max: number, windowMs: number) =>
    new InMemoryRateLimit(max, windowMs),
};

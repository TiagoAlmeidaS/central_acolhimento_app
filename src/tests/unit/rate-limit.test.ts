import { describe, it, expect, vi } from "vitest";
import { __testing } from "@/lib/auth/rate-limit";
import { faker } from "@/tests/factories";

/**
 * Rate limit — testes do fallback in-memory que roda em dev/test quando
 * `UPSTASH_REDIS_*` não está configurado.
 */

describe("in-memory rate limiter", () => {
  it("permite N requests dentro da janela e bloqueia o N+1", async () => {
    const max = 5;
    const limiter = __testing.createInMemoryLimiter(max, 60_000);
    const key = `ip:${faker.internet.ip()}`;

    for (let i = 0; i < max; i++) {
      const r = await limiter.limit(key);
      expect(r.success).toBe(true);
      expect(r.remaining).toBe(max - 1 - i);
    }
    const overflow = await limiter.limit(key);
    expect(overflow.success).toBe(false);
    expect(overflow.remaining).toBe(0);
  });

  it("reseta após a janela expirar", async () => {
    vi.useFakeTimers();
    try {
      const limiter = __testing.createInMemoryLimiter(2, 1_000);
      const key = faker.string.uuid();

      expect((await limiter.limit(key)).success).toBe(true);
      expect((await limiter.limit(key)).success).toBe(true);
      expect((await limiter.limit(key)).success).toBe(false);

      vi.advanceTimersByTime(1_100);

      const afterReset = await limiter.limit(key);
      expect(afterReset.success).toBe(true);
      expect(afterReset.remaining).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("isola chaves diferentes", async () => {
    const limiter = __testing.createInMemoryLimiter(1, 60_000);
    const keyA = faker.internet.ip();
    const keyB = faker.internet.ip();

    expect((await limiter.limit(keyA)).success).toBe(true);
    expect((await limiter.limit(keyA)).success).toBe(false);
    expect((await limiter.limit(keyB)).success).toBe(true);
  });

  it("reset.reset retorna timestamp futuro consistente", async () => {
    const limiter = __testing.createInMemoryLimiter(3, 5_000);
    const before = Date.now();
    const r = await limiter.limit(faker.string.uuid());
    expect(r.reset).toBeGreaterThanOrEqual(before + 4_900);
    expect(r.reset).toBeLessThanOrEqual(before + 5_100);
  });
});

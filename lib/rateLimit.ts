// In-memory token bucket rate limiter for API protection
interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit = 60,
  windowMs = 60 * 1000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  let record = rateLimitMap.get(identifier);

  if (!record) {
    record = { tokens: limit - 1, lastRefill: now };
    rateLimitMap.set(identifier, record);
    return { success: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  // Refill tokens proportionally
  const elapsed = now - record.lastRefill;
  if (elapsed > windowMs) {
    record.tokens = limit - 1;
    record.lastRefill = now;
    return { success: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.tokens > 0) {
    record.tokens -= 1;
    return { success: true, remaining: record.tokens, resetTime: record.lastRefill + windowMs };
  }

  return { success: false, remaining: 0, resetTime: record.lastRefill + windowMs };
}

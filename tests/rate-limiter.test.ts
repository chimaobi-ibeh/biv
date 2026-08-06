import { describe, it, expect, vi, afterEach } from 'vitest';
import { checkRateLimit, getClientIP } from '@/lib/rate-limiter';

const config = { maxRequests: 3, windowSeconds: 60 };

// The limiter keeps a module-level store, so every test uses a fresh key.
let keyCounter = 0;
const freshKey = () => `test-key-${keyCounter++}`;

afterEach(() => {
  vi.useRealTimers();
});

describe('checkRateLimit', () => {
  it('allows requests up to the configured maximum', () => {
    const key = freshKey();

    expect(checkRateLimit(key, config)).toMatchObject({ allowed: true, remaining: 2 });
    expect(checkRateLimit(key, config)).toMatchObject({ allowed: true, remaining: 1 });
    expect(checkRateLimit(key, config)).toMatchObject({ allowed: true, remaining: 0 });
  });

  it('blocks the request after the maximum is reached', () => {
    const key = freshKey();
    for (let i = 0; i < config.maxRequests; i++) checkRateLimit(key, config);

    const blocked = checkRateLimit(key, config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInSeconds).toBeGreaterThan(0);
  });

  it('keeps blocking while the window is still open', () => {
    const key = freshKey();
    for (let i = 0; i < 10; i++) checkRateLimit(key, config);

    expect(checkRateLimit(key, config).allowed).toBe(false);
  });

  it('tracks each key independently', () => {
    const a = freshKey();
    const b = freshKey();

    for (let i = 0; i < config.maxRequests; i++) checkRateLimit(a, config);

    expect(checkRateLimit(a, config).allowed).toBe(false);
    expect(checkRateLimit(b, config).allowed).toBe(true);
  });

  it('allows requests again once the window expires', () => {
    vi.useFakeTimers();
    const key = freshKey();

    for (let i = 0; i < config.maxRequests; i++) checkRateLimit(key, config);
    expect(checkRateLimit(key, config).allowed).toBe(false);

    vi.advanceTimersByTime(config.windowSeconds * 1000 + 1);

    const afterReset = checkRateLimit(key, config);
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(config.maxRequests - 1);
  });

  it('counts down resetInSeconds as the window elapses', () => {
    vi.useFakeTimers();
    const key = freshKey();

    checkRateLimit(key, config);
    vi.advanceTimersByTime(30_000);

    const second = checkRateLimit(key, config);
    expect(second.resetInSeconds).toBeLessThanOrEqual(30);
    expect(second.resetInSeconds).toBeGreaterThan(0);
  });
});

describe('getClientIP', () => {
  const requestWith = (headers: Record<string, string>) =>
    new Request('https://example.com', { headers });

  it('prefers x-vercel-forwarded-for, which a caller cannot forge', () => {
    const request = requestWith({
      'x-vercel-forwarded-for': '203.0.113.5',
      'x-forwarded-for': 'spoofed-by-client',
      'x-real-ip': '198.51.100.7',
    });
    expect(getClientIP(request)).toBe('203.0.113.5');
  });

  it('gives a spoofed x-forwarded-for no effect when the platform header is present', () => {
    const bucketFor = (spoof: string) =>
      getClientIP(
        requestWith({
          'x-vercel-forwarded-for': '203.0.113.5',
          'x-forwarded-for': spoof,
        })
      );

    // Rotating x-forwarded-for must not mint a fresh rate-limit bucket.
    expect(bucketFor('1.1.1.1')).toBe(bucketFor('2.2.2.2'));
  });

  it('reads the first entry of x-forwarded-for', () => {
    const request = requestWith({ 'x-forwarded-for': '203.0.113.5, 70.41.3.18' });
    expect(getClientIP(request)).toBe('203.0.113.5');
  });

  it('trims whitespace around the address', () => {
    const request = requestWith({ 'x-forwarded-for': '  203.0.113.5  ' });
    expect(getClientIP(request)).toBe('203.0.113.5');
  });

  it('falls back to x-real-ip', () => {
    const request = requestWith({ 'x-real-ip': '198.51.100.7' });
    expect(getClientIP(request)).toBe('198.51.100.7');
  });

  it('prefers x-forwarded-for over x-real-ip', () => {
    const request = requestWith({
      'x-forwarded-for': '203.0.113.5',
      'x-real-ip': '198.51.100.7',
    });
    expect(getClientIP(request)).toBe('203.0.113.5');
  });

  it('returns a shared fallback key when no proxy headers are present', () => {
    expect(getClientIP(requestWith({}))).toBe('unknown-client');
  });

  it('groups every header-less caller under one bucket, so they share a limit', () => {
    // Documents the current behaviour: with no proxy headers all callers
    // collide on 'unknown-client' and rate-limit each other.
    const a = getClientIP(requestWith({}));
    const b = getClientIP(requestWith({ 'user-agent': 'other' }));
    expect(a).toBe(b);
  });
});

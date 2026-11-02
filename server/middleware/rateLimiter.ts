import { Request, Response, NextFunction } from "express";
import { rateLimitConfig } from "../../shared/config";

interface RateLimitRecord {
  count: number;
  resetTime: number;
  failedAttempts: number;
  nextAllowedTime: number;
}

// In-Memory Storage for Rate Limits
const ipStore = new Map<string, RateLimitRecord>();
const accountStore = new Map<string, RateLimitRecord>();

/**
 * Clean up expired records periodically
 */
setInterval(() => {
  const now = Date.now();
  ipStore.forEach((record, key) => {
    if (now > record.resetTime && now > record.nextAllowedTime) {
      ipStore.delete(key);
    }
  });
  accountStore.forEach((record, key) => {
    if (now > record.resetTime && now > record.nextAllowedTime) {
      accountStore.delete(key);
    }
  });
}, 60 * 1000);

/**
 * Helper to retrieve client IP
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}

/**
 * Strict Auth Rate Limiter
 * Combines Per-IP and Per-Account limits with Exponential Backoff
 */
export function authRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();
  const ip = getClientIp(req);
  
  // Extract account identifier (email, phone, or customEmail)
  const account =
    req.body?.email ||
    req.body?.phone ||
    req.body?.customEmail ||
    req.body?.licenseNo ||
    "anonymous_auth";

  const ipKey = `auth:ip:${ip}`;
  const accountKey = `auth:account:${account}`;

  // Get or initialize records
  let ipRecord = ipStore.get(ipKey);
  if (!ipRecord || now > ipRecord.resetTime) {
    ipRecord = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
      failedAttempts: ipRecord?.failedAttempts || 0,
      nextAllowedTime: 0,
    };
    ipStore.set(ipKey, ipRecord);
  }

  let accountRecord = accountStore.get(accountKey);
  if (!accountRecord || now > accountRecord.resetTime) {
    accountRecord = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
      failedAttempts: accountRecord?.failedAttempts || 0,
      nextAllowedTime: 0,
    };
    accountStore.set(accountKey, accountRecord);
  }

  // Check exponential backoff active window
  if (now < ipRecord.nextAllowedTime || now < accountRecord.nextAllowedTime) {
    const retryAfterSeconds = Math.ceil(
      (Math.max(ipRecord.nextAllowedTime, accountRecord.nextAllowedTime) - now) / 1000
    );
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: "Too many authentication requests.",
      message: `Exponential backoff active. Please wait ${retryAfterSeconds} seconds before trying again.`,
      retryAfterSeconds,
    });
    return;
  }

  // Check max attempts per window
  if (ipRecord.count >= rateLimitConfig.authIpMax || accountRecord.count >= rateLimitConfig.authAccountMax) {
    // Increment failed attempts & calculate exponential backoff delay (2s, 4s, 8s, 16s, etc.)
    const attempts = Math.max(ipRecord.failedAttempts, accountRecord.failedAttempts) + 1;
    const backoffSeconds = Math.min(Math.pow(2, attempts - 1) * 2, 900); // max 15 mins backoff
    const nextAllowed = now + backoffSeconds * 1000;

    ipRecord.failedAttempts = attempts;
    ipRecord.nextAllowedTime = nextAllowed;
    accountRecord.failedAttempts = attempts;
    accountRecord.nextAllowedTime = nextAllowed;

    res.setHeader("Retry-After", String(backoffSeconds));
    res.status(429).json({
      error: "Rate limit exceeded on authentication endpoint.",
      message: `Account or IP limit reached. Exponential backoff enforced for ${backoffSeconds} seconds.`,
      retryAfterSeconds: backoffSeconds,
    });
    return;
  }

  // Increment request counts
  ipRecord.count += 1;
  accountRecord.count += 1;

  res.setHeader("X-RateLimit-Limit-IP", String(rateLimitConfig.authIpMax));
  res.setHeader("X-RateLimit-Remaining-IP", String(Math.max(0, rateLimitConfig.authIpMax - ipRecord.count)));

  next();
}

/**
 * Moderate Public Endpoints Rate Limiter (Per-IP)
 */
export function publicRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();
  const ip = getClientIp(req);
  const key = `public:ip:${ip}`;

  let record = ipStore.get(key);
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
      failedAttempts: 0,
      nextAllowedTime: 0,
    };
    ipStore.set(key, record);
  }

  if (record.count >= rateLimitConfig.publicMax) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: "Too Many Requests",
      message: `Public rate limit exceeded (${rateLimitConfig.publicMax} reqs/window). Try again in ${retryAfterSeconds} seconds.`,
    });
    return;
  }

  record.count += 1;
  res.setHeader("X-RateLimit-Limit", String(rateLimitConfig.publicMax));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, rateLimitConfig.publicMax - record.count)));

  next();
}

/**
 * Looser Authenticated User Actions Rate Limiter (Per User ID / IP)
 */
export function authenticatedUserRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();
  const userId = (req.headers["x-user-id"] as string) || getClientIp(req);
  const key = `user:action:${userId}`;

  let record = ipStore.get(key);
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
      failedAttempts: 0,
      nextAllowedTime: 0,
    };
    ipStore.set(key, record);
  }

  if (record.count >= rateLimitConfig.userMax) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: "Too Many Requests",
      message: `User action limit exceeded (${rateLimitConfig.userMax} reqs/window). Try again in ${retryAfterSeconds} seconds.`,
    });
    return;
  }

  record.count += 1;
  res.setHeader("X-RateLimit-Limit", String(rateLimitConfig.userMax));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, rateLimitConfig.userMax - record.count)));

  next();
}

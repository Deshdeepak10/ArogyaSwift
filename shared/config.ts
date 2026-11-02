/**
 * Shared Application & Rate Limiting Configuration
 * Supports environment variables with safe fallback defaults.
 */

export interface RateLimitConfig {
  windowMs: number;
  authIpMax: number;
  authAccountMax: number;
  publicMax: number;
  userMax: number;
}

export const rateLimitConfig: RateLimitConfig = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  authIpMax: Number(process.env.RATE_LIMIT_AUTH_IP_MAX) || 5,
  authAccountMax: Number(process.env.RATE_LIMIT_AUTH_ACCOUNT_MAX) || 5,
  publicMax: Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 60,
  userMax: Number(process.env.RATE_LIMIT_USER_MAX) || 300,
};

export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  isProduction: process.env.NODE_ENV === "production",
  rateLimit: rateLimitConfig,
};

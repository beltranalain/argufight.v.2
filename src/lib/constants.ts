// App metadata
export const APP_NAME = "ArguFight";
export const APP_DESCRIPTION =
  "The AI-judged online debate platform. Challenge opponents, argue your case, and let AI judges deliver the verdict.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://argufight.com";

// Debate defaults
export const DEFAULT_ROUNDS = 3;
export const DEFAULT_ROUND_DURATION = 24; // hours
export const MAX_STATEMENT_LENGTH = 10000;
export const MIN_STATEMENT_LENGTH = 50;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Cache TTLs (seconds)
export const CACHE_TTL = {
  LEADERBOARD: 300, // 5 minutes
  USER_PROFILE: 300, // 5 minutes
  DEBATE_LIST: 60, // 1 minute
  HOMEPAGE: 300, // 5 minutes
  CATEGORIES: 3600, // 1 hour
  FEATURE_FLAGS: 300, // 5 minutes
} as const;

// ELO defaults
export const DEFAULT_ELO = 1200;
export const ELO_K_FACTOR = 32;

// Subscription tiers
export const TIERS = {
  FREE: "FREE",
  PRO: "PRO",
  PREMIUM: "PREMIUM",
} as const;

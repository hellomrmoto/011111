import type { Sport } from "@/types/bet";
import type { GameResult, ClosingLine } from "@/types/scraping";

export interface PublicSportsProvider {
  fetchGameResults(opts: {
    sport: Sport;
    fromISO: string;
    toISO: string;
  }): Promise<GameResult[]>;

  fetchClosingLines(opts: {
    sport: Sport;
    gameId: string;
    market: string;
  }): Promise<ClosingLine | null>;
}

// Token bucket rate limiter: 5 req/sec
class TokenBucket {
  private tokens: number;
  private readonly max: number;
  private lastRefill: number;

  constructor(max: number) {
    this.tokens = max;
    this.max = max;
    this.lastRefill = Date.now();
  }

  async consume(): Promise<void> {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.max, this.tokens + elapsed * this.max);
    this.lastRefill = now;

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    const wait = (1 - this.tokens) * (1000 / this.max);
    await new Promise((r) => setTimeout(r, wait));
    this.tokens = 0;
  }
}

export const rateLimiter = new TokenBucket(5);

const resultCache = new Map<string, GameResult>();

export function cacheGameResult(result: GameResult): void {
  resultCache.set(`${result.sport}:${result.gameId}`, result);
}

export function getCachedResult(sport: Sport, gameId: string): GameResult | undefined {
  return resultCache.get(`${sport}:${gameId}`);
}

export function clearResultCache(): void {
  resultCache.clear();
}

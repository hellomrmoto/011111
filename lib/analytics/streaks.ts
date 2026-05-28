import type { Bet } from "@/types/bet";

export interface StreakSegment {
  type: "WIN" | "LOSS";
  count: number;
  from: string;
  to: string;
}

export function computeStreakHistory(bets: Bet[]): StreakSegment[] {
  const settled = bets
    .filter((b) => b.status === "WON" || b.status === "LOST")
    .sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime());

  const segments: StreakSegment[] = [];
  let current: StreakSegment | null = null;

  for (const bet of settled) {
    const type = bet.status === "WON" ? "WIN" : "LOSS";
    if (!current) {
      current = { type, count: 1, from: bet.placedAt, to: bet.placedAt };
    } else if (current.type === type) {
      current.count++;
      current.to = bet.placedAt;
    } else {
      segments.push(current);
      current = { type, count: 1, from: bet.placedAt, to: bet.placedAt };
    }
  }

  if (current) segments.push(current);
  return segments;
}

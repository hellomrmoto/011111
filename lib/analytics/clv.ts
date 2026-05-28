import { americanToImpliedProb } from "@/lib/parsing/oddsConvert";

export function computeClvBps(
  betOddsAmerican: number,
  closingOddsAmerican: number
): number {
  const betProb = americanToImpliedProb(betOddsAmerican);
  const closeProb = americanToImpliedProb(closingOddsAmerican);
  // Positive CLV = we got better odds than close (our implied prob is lower = better price)
  return Math.round((closeProb - betProb) * 10000);
}

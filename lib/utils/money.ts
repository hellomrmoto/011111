const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function formatMoney(cents: number): string {
  const dollars = centsToDollars(cents);
  if (dollars < 0) {
    return "-" + fmt.format(Math.abs(dollars));
  }
  return fmt.format(dollars);
}

export function formatMoneyCompact(cents: number): string {
  const abs = Math.abs(cents);
  const dollars = abs / 100;
  const prefix = cents < 0 ? "-$" : "$";
  if (dollars >= 1_000_000) return `${prefix}${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `${prefix}${(dollars / 1_000).toFixed(1)}K`;
  return formatMoney(cents);
}

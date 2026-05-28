import {
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
  startOfYear,
  format,
  isValid,
  parse,
} from "date-fns";

export function toISOString(date: Date): string {
  return date.toISOString();
}

export function formatDisplay(iso: string): string {
  try {
    return format(parseISO(iso), "MM/dd/yyyy");
  } catch {
    return iso;
  }
}

export function formatDisplayFull(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export function parseFlexDate(input: string | number): string | null {
  if (typeof input === "number") {
    // Excel serial number
    const date = excelSerialToDate(input);
    return date ? date.toISOString() : null;
  }

  const s = input.trim();

  // Try ISO 8601
  const iso = parseISO(s);
  if (isValid(iso)) return iso.toISOString();

  // Try MM/DD/YYYY HH:mm
  const fmt1 = parse(s, "MM/dd/yyyy HH:mm", new Date());
  if (isValid(fmt1)) return fmt1.toISOString();

  // Try MM/DD/YYYY
  const fmt2 = parse(s, "MM/dd/yyyy", new Date());
  if (isValid(fmt2)) return fmt2.toISOString();

  // Try M/D/YYYY
  const fmt3 = parse(s, "M/d/yyyy", new Date());
  if (isValid(fmt3)) return fmt3.toISOString();

  return null;
}

function excelSerialToDate(serial: number): Date | null {
  if (serial < 1) return null;
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + serial * 86400000);
  return isValid(date) ? date : null;
}

export function getPresetRange(preset: string): { from: string | null; to: string | null } {
  const now = new Date();
  switch (preset) {
    case "7D":
      return {
        from: startOfDay(subDays(now, 7)).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    case "30D":
      return {
        from: startOfDay(subDays(now, 30)).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    case "90D":
      return {
        from: startOfDay(subDays(now, 90)).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    case "YTD":
      return {
        from: startOfYear(now).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    default:
      return { from: null, to: null };
  }
}

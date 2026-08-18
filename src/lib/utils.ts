import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes safely with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as Tunisian Dinar (DT) with 3 decimal places (millimes standard)
 * @example formatCurrency(142.5) => "142.500 DT"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0.000 DT";
  }
  return `${amount.toFixed(3)} DT`;
}

/**
 * Formats a ratio as a percentage string with 1 decimal place
 * @example formatPercent(0.654) => "65.4%"
 */
export function formatPercent(rate: number | null | undefined): string {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return "—";
  }
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Safely divides two numbers, returning null (or a custom fallback) when denominator is zero
 * AD-6 Math Invariant: Never emit NaN or Infinity to the UI
 */
export function safeDivide(
  numerator: number,
  denominator: number,
  fallback: number | null = null
): number | null {
  if (!denominator || denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
    return fallback;
  }
  return numerator / denominator;
}

/**
 * Renders a metric value or fallback em-dash if value is null or undefined
 */
export function renderMetric(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return String(value);
}

export type FollowUpPresetKey =
  | "IN_2_HOURS"
  | "IN_4_HOURS"
  | "TOMORROW_MORNING"
  | "TOMORROW_AFTERNOON";

export interface FollowUpPresetOption {
  key: FollowUpPresetKey;
  label: string;
  description: string;
}

export const FOLLOWUP_PRESETS: FollowUpPresetOption[] = [
  {
    key: "IN_2_HOURS",
    label: "In 2 Hours",
    description: "Retry after lunch / afternoon (+2h)",
  },
  {
    key: "IN_4_HOURS",
    label: "In 4 Hours",
    description: "Retry early evening (+4h)",
  },
  {
    key: "TOMORROW_MORNING",
    label: "Tomorrow Morning (10:00 AM)",
    description: "Next business day morning shift",
  },
  {
    key: "TOMORROW_AFTERNOON",
    label: "Tomorrow Afternoon (3:00 PM)",
    description: "Next business day afternoon shift",
  },
];

/**
 * Computes ISO timestamp for a selected follow-up preset (FR-27).
 * Pure domain function (AD-1).
 */
export function computeFollowUpTimestamp(
  preset: FollowUpPresetKey,
  baseDate: Date = new Date()
): string {
  const target = new Date(baseDate.getTime());

  switch (preset) {
    case "IN_2_HOURS":
      target.setTime(target.getTime() + 2 * 60 * 60 * 1000);
      break;

    case "IN_4_HOURS":
      target.setTime(target.getTime() + 4 * 60 * 60 * 1000);
      break;

    case "TOMORROW_MORNING":
      target.setDate(target.getDate() + 1);
      target.setHours(10, 0, 0, 0);
      break;

    case "TOMORROW_AFTERNOON":
      target.setDate(target.getDate() + 1);
      target.setHours(15, 0, 0, 0);
      break;
  }

  return target.toISOString();
}

/**
 * Checks if max call attempts threshold has been reached (FR-28)
 */
export function isMaxAttemptsReached(
  attemptCount: number,
  maxLimit: number = 3
): boolean {
  return attemptCount >= maxLimit;
}

/**
 * Checks if a scheduled follow-up is currently due or overdue
 */
export function isFollowUpDue(
  nextFollowUpAt: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!nextFollowUpAt) return false;
  return new Date(nextFollowUpAt).getTime() <= now.getTime();
}

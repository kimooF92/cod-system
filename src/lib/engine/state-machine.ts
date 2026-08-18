import type { ProductStatus } from "../validations/product";

export interface StatusMetadata {
  status: ProductStatus;
  label: string;
  description: string;
  badgeVariant: "scale" | "winner" | "hold" | "kill" | "testing" | "iterate" | "neutral";
  allowedNextStatuses: ProductStatus[];
}

export const PRODUCT_STATUS_MAP: Record<ProductStatus, StatusMetadata> = {
  IDEA: {
    status: "IDEA",
    label: "Idea",
    description: "Raw unvalidated concept",
    badgeVariant: "neutral",
    allowedNextStatuses: ["RESEARCH", "READY", "ARCHIVED"],
  },
  RESEARCH: {
    status: "RESEARCH",
    label: "Research",
    description: "Checking supplier costs and competitor angles",
    badgeVariant: "testing",
    allowedNextStatuses: ["READY", "HOLD", "KILL", "ARCHIVED"],
  },
  READY: {
    status: "READY",
    label: "Ready for Test",
    description: "Validated unit economics, ready for first ad test",
    badgeVariant: "iterate",
    allowedNextStatuses: ["TESTING", "HOLD", "ARCHIVED"],
  },
  TESTING: {
    status: "TESTING",
    label: "Testing",
    description: "Active ad campaigns and confirmation testing",
    badgeVariant: "testing",
    allowedNextStatuses: ["WINNER", "HOLD", "KILL"],
  },
  HOLD: {
    status: "HOLD",
    label: "On Hold",
    description: "Paused for creative refresh or courier restock",
    badgeVariant: "hold",
    allowedNextStatuses: ["TESTING", "READY", "KILL", "ARCHIVED"],
  },
  KILL: {
    status: "KILL",
    label: "Killed",
    description: "Discontinued due to sub-target economics or high returns",
    badgeVariant: "kill",
    allowedNextStatuses: ["TESTING", "ARCHIVED"],
  },
  WINNER: {
    status: "WINNER",
    label: "Winner",
    description: "Proven profitable unit economics meeting scale criteria",
    badgeVariant: "winner",
    allowedNextStatuses: ["SCALING", "HOLD", "FATIGUED"],
  },
  SCALING: {
    status: "SCALING",
    label: "Scaling",
    description: "Active high-volume lead ramp (10–25+ leads/day)",
    badgeVariant: "scale",
    allowedNextStatuses: ["WINNER", "HOLD", "FATIGUED", "KILL"],
  },
  FATIGUED: {
    status: "FATIGUED",
    label: "Fatigued",
    description: "Creative exhaustion or rising CPL needing angle pivot",
    badgeVariant: "hold",
    allowedNextStatuses: ["TESTING", "HOLD", "KILL", "ARCHIVED"],
  },
  ARCHIVED: {
    status: "ARCHIVED",
    label: "Archived",
    description: "Historical inactive product record",
    badgeVariant: "neutral",
    allowedNextStatuses: ["IDEA", "RESEARCH", "READY"],
  },
};

/**
 * Checks if a status transition is formally permitted in standard flow.
 * Note: Manual owner override can force any transition with recorded reason.
 */
export function isValidStatusTransition(
  from: ProductStatus,
  to: ProductStatus
): boolean {
  if (from === to) return true;
  const meta = PRODUCT_STATUS_MAP[from];
  return meta ? meta.allowedNextStatuses.includes(to) : false;
}

/**
 * Returns metadata and styling helpers for a product status.
 */
export function getStatusMetadata(status: ProductStatus): StatusMetadata {
  return (
    PRODUCT_STATUS_MAP[status] || {
      status,
      label: status,
      description: "Product status",
      badgeVariant: "neutral",
      allowedNextStatuses: [],
    }
  );
}

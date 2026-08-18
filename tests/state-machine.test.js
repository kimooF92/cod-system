const test = require("node:test");
const assert = require("node:assert/strict");

const PRODUCT_STATUS_MAP = {
  IDEA: { allowedNextStatuses: ["RESEARCH", "READY", "ARCHIVED"] },
  RESEARCH: { allowedNextStatuses: ["READY", "HOLD", "KILL", "ARCHIVED"] },
  READY: { allowedNextStatuses: ["TESTING", "HOLD", "ARCHIVED"] },
  TESTING: { allowedNextStatuses: ["WINNER", "HOLD", "KILL"] },
  HOLD: { allowedNextStatuses: ["TESTING", "READY", "KILL", "ARCHIVED"] },
  KILL: { allowedNextStatuses: ["TESTING", "ARCHIVED"] },
  WINNER: { allowedNextStatuses: ["SCALING", "HOLD", "FATIGUED"] },
  SCALING: { allowedNextStatuses: ["WINNER", "HOLD", "FATIGUED", "KILL"] },
  FATIGUED: { allowedNextStatuses: ["TESTING", "HOLD", "KILL", "ARCHIVED"] },
  ARCHIVED: { allowedNextStatuses: ["IDEA", "RESEARCH", "READY"] },
};

function isValidStatusTransition(from, to) {
  if (from === to) return true;
  const meta = PRODUCT_STATUS_MAP[from];
  return meta ? meta.allowedNextStatuses.includes(to) : false;
}

test("isValidStatusTransition validates natural lifecycle flow", () => {
  // READY -> TESTING is valid
  assert.equal(isValidStatusTransition("READY", "TESTING"), true);
  // TESTING -> WINNER is valid
  assert.equal(isValidStatusTransition("TESTING", "WINNER"), true);
  // WINNER -> SCALING is valid
  assert.equal(isValidStatusTransition("WINNER", "SCALING"), true);
  // Same status is always valid
  assert.equal(isValidStatusTransition("WINNER", "WINNER"), true);
});

test("isValidStatusTransition flags non-standard leaps", () => {
  // IDEA cannot jump directly to SCALING in standard flow
  assert.equal(isValidStatusTransition("IDEA", "SCALING"), false);
  // KILL cannot jump directly to SCALING without testing
  assert.equal(isValidStatusTransition("KILL", "SCALING"), false);
});

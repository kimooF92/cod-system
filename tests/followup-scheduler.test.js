const test = require("node:test");
const assert = require("node:assert/strict");

function computeFollowUpTimestamp(preset, baseDate = new Date()) {
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

function isMaxAttemptsReached(attemptCount, maxLimit = 3) {
  return attemptCount >= maxLimit;
}

function isFollowUpDue(nextFollowUpAt, now = new Date()) {
  if (!nextFollowUpAt) return false;
  return new Date(nextFollowUpAt).getTime() <= now.getTime();
}

test("computeFollowUpTimestamp schedules +2h and +4h accurately", () => {
  const base = new Date("2026-08-19T10:00:00.000Z");
  const in2h = computeFollowUpTimestamp("IN_2_HOURS", base);
  assert.equal(in2h, "2026-08-19T12:00:00.000Z");

  const in4h = computeFollowUpTimestamp("IN_4_HOURS", base);
  assert.equal(in4h, "2026-08-19T14:00:00.000Z");
});

test("isMaxAttemptsReached enforces 3-strike rule (FR-28)", () => {
  assert.equal(isMaxAttemptsReached(0), false);
  assert.equal(isMaxAttemptsReached(1), false);
  assert.equal(isMaxAttemptsReached(2), false);
  assert.equal(isMaxAttemptsReached(3), true);
  assert.equal(isMaxAttemptsReached(4), true);
});

test("isFollowUpDue detects overdue callbacks", () => {
  const past = new Date(Date.now() - 3600000).toISOString();
  const future = new Date(Date.now() + 3600000).toISOString();

  assert.equal(isFollowUpDue(past), true);
  assert.equal(isFollowUpDue(future), false);
  assert.equal(isFollowUpDue(null), false);
});

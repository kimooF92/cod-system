const test = require("node:test");
const assert = require("node:assert/strict");

const VALID_HOOK_TYPES = [
  "QUESTION",
  "BOLD_CLAIM",
  "PROBLEM_AGITATION",
  "CURIOSITY_GAP",
  "SOCIAL_PROOF",
  "OFFER_LED",
  "DEMONSTRATION",
];

const VALID_CREATIVE_FORMATS = [
  "PROBLEM_SOLUTION",
  "DEMONSTRATION",
  "UGC_TESTIMONIAL",
  "UNBOXING",
  "COMPARISON",
  "OFFER_LED",
  "AUTHORITY_REVIEW",
];

function validateAngle(input) {
  if (!input.product_id || input.product_id.trim() === "") return false;
  if (!input.name || input.name.trim().length < 2) return false;
  if (!input.pain_point || input.pain_point.trim().length < 3) return false;
  if (!input.promise || input.promise.trim().length < 3) return false;
  if (input.creative_format && !VALID_CREATIVE_FORMATS.includes(input.creative_format)) return false;
  return true;
}

function validateHook(input) {
  if (!input.angle_id || input.angle_id.trim() === "") return false;
  if (!input.hook_text || input.hook_text.trim().length < 3) return false;
  if (!VALID_HOOK_TYPES.includes(input.hook_type)) return false;
  return true;
}

test("validateAngle validates correct marketing angle data", () => {
  const valid = validateAngle({
    product_id: "prod-1",
    name: "Pothole Proof",
    pain_point: "Phone falling on bumps",
    promise: "Zero phone drops",
    creative_format: "DEMONSTRATION",
  });
  assert.equal(valid, true);
});

test("validateAngle rejects missing product or short name", () => {
  assert.equal(validateAngle({ product_id: "", name: "Pothole" }), false);
  assert.equal(validateAngle({ product_id: "prod-1", name: "A" }), false);
});

test("validateHook validates supported hook types", () => {
  const valid = validateHook({
    angle_id: "angle-1",
    hook_text: "Tired of your phone flying off the dashboard?",
    hook_type: "PROBLEM_AGITATION",
  });
  assert.equal(valid, true);

  const invalidType = validateHook({
    angle_id: "angle-1",
    hook_text: "Test hook",
    hook_type: "INVALID_HOOK_TYPE",
  });
  assert.equal(invalidType, false);
});

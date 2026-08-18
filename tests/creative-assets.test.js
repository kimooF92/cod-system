const test = require("node:test");
const assert = require("node:assert/strict");

const VALID_ASSET_TYPES = ["VIDEO", "IMAGE", "CAROUSEL"];
const VALID_ASPECT_RATIOS = ["9:16", "1:1", "4:5", "16:9"];
const VALID_LIFECYCLE_STATUSES = ["TESTING", "ACTIVE", "FATIGUED", "PAUSED", "ARCHIVED"];
const VALID_PERFORMANCE_TAGS = ["WINNER", "KEEP", "ITERATE", "KILL"];

function validateCreativeAsset(input) {
  if (!input.code || input.code.trim().length < 3) return false;
  if (!input.product_id || input.product_id.trim() === "") return false;
  if (!VALID_ASSET_TYPES.includes(input.asset_type)) return false;
  if (!VALID_ASPECT_RATIOS.includes(input.aspect_ratio)) return false;
  if (input.lifecycle_status && !VALID_LIFECYCLE_STATUSES.includes(input.lifecycle_status)) return false;
  if (input.performance_tag && !VALID_PERFORMANCE_TAGS.includes(input.performance_tag)) return false;
  return true;
}

test("validateCreativeAsset validates correct creative asset record", () => {
  const valid = validateCreativeAsset({
    code: "CR-001",
    product_id: "prod-1",
    asset_type: "VIDEO",
    aspect_ratio: "9:16",
    lifecycle_status: "ACTIVE",
    performance_tag: "WINNER",
  });
  assert.equal(valid, true);
});

test("validateCreativeAsset rejects invalid aspect ratios or asset types", () => {
  assert.equal(
    validateCreativeAsset({
      code: "CR-001",
      product_id: "prod-1",
      asset_type: "INVALID",
      aspect_ratio: "9:16",
    }),
    false
  );

  assert.equal(
    validateCreativeAsset({
      code: "CR-001",
      product_id: "prod-1",
      asset_type: "VIDEO",
      aspect_ratio: "21:9", // unsupported
    }),
    false
  );
});

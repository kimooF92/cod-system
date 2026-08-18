const test = require("node:test");
const assert = require("node:assert/strict");

const VALID_PLATFORMS = ["META_ADS", "TIKTOK_ADS", "SNAPCHAT_ADS", "GOOGLE_ADS"];
const VALID_OBJECTIVES = ["TESTING", "SCALING", "RETARGETING", "WARMUP"];
const VALID_STATUSES = ["ACTIVE", "PAUSED", "ARCHIVED"];

function validateCampaign(input) {
  if (!input.name || input.name.trim().length < 2) return false;
  if (!VALID_PLATFORMS.includes(input.platform)) return false;
  if (!VALID_OBJECTIVES.includes(input.objective)) return false;
  if (typeof input.daily_budget !== "number" || input.daily_budget < 5.0) return false;
  if (input.status && !VALID_STATUSES.includes(input.status)) return false;
  return true;
}

function validateAd(input) {
  if (!input.ad_set_id || input.ad_set_id.trim() === "") return false;
  if (!input.name || input.name.trim().length < 2) return false;
  if (!input.product_id || input.product_id.trim() === "") return false;
  if (!input.creative_id || input.creative_id.trim() === "") return false;
  return true;
}

test("validateCampaign validates correct campaign data", () => {
  const valid = validateCampaign({
    name: "CBO - Winners Scale Q3",
    platform: "META_ADS",
    objective: "SCALING",
    daily_budget: 120.0,
    status: "ACTIVE",
  });
  assert.equal(valid, true);
});

test("validateCampaign rejects daily budget less than 5 DT", () => {
  assert.equal(
    validateCampaign({
      name: "CBO - Low Budget",
      platform: "META_ADS",
      objective: "TESTING",
      daily_budget: 2.0, // too low
    }),
    false
  );
});

test("validateAd validates complete ad mapping with product and creative asset", () => {
  const valid = validateAd({
    ad_set_id: "adset-1",
    name: "CR-001 - Pothole Speed Test UGC",
    product_id: "prod-1",
    creative_id: "asset-1",
  });
  assert.equal(valid, true);

  assert.equal(
    validateAd({
      ad_set_id: "adset-1",
      name: "CR-001",
      product_id: "", // missing product
      creative_id: "asset-1",
    }),
    false
  );
});

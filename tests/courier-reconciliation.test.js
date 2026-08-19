const test = require("node:test");
const assert = require("node:assert/strict");

const COURIER_PRESETS = [
  "Aramex Tunisia",
  "First Delivery Express",
  "Maystro Delivery",
  "Quick Express",
  "Colis Express",
  "Other",
];

const RETURN_REASONS = [
  "Customer Refused on Delivery",
  "Unreachable / Wrong Phone",
  "Wrong Address / Incomplete",
  "Wrong Item Shipped",
  "Late Delivery / Cancelled by Customer",
  "Damaged in Transit",
  "Other",
];

function validateReconciliation(input) {
  const allowedStatuses = ["DISPATCHED", "DELIVERED", "RETURNED", "CANCELLED"];
  if (!allowedStatuses.includes(input.status)) {
    return { valid: false, error: "Invalid status" };
  }

  if (input.status === "RETURNED") {
    if (!input.return_reason || typeof input.return_reason !== "string") {
      return { valid: false, error: "Return reason is required for returned orders" };
    }
    const fee = input.return_fee !== undefined ? Number(input.return_fee) : 3.5;
    if (isNaN(fee) || fee < 0) {
      return { valid: false, error: "Return fee cannot be negative" };
    }
  }

  return {
    valid: true,
    data: {
      status: input.status,
      courier_name: input.courier_name || null,
      tracking_code: input.tracking_code || null,
      return_reason: input.status === "RETURNED" ? (input.return_reason || "Customer Refused on Delivery") : null,
      return_fee: input.status === "RETURNED" ? (input.return_fee !== undefined ? Number(input.return_fee) : 3.5) : 3.5,
      notes: input.notes || null,
    },
  };
}

function validateBatchDispatch(input) {
  if (!input.order_ids || !Array.isArray(input.order_ids) || input.order_ids.length === 0) {
    return { valid: false, error: "At least one order must be selected" };
  }
  if (!input.courier_name || typeof input.courier_name !== "string" || input.courier_name.trim() === "") {
    return { valid: false, error: "Courier name is required" };
  }
  return {
    valid: true,
    data: {
      order_ids: input.order_ids,
      courier_name: input.courier_name.trim(),
      notes: input.notes || null,
    },
  };
}

test("Courier presets include standard Tunisian carriers", () => {
  assert.ok(COURIER_PRESETS.includes("Aramex Tunisia"));
  assert.ok(COURIER_PRESETS.includes("First Delivery Express"));
  assert.ok(COURIER_PRESETS.includes("Maystro Delivery"));
  assert.ok(COURIER_PRESETS.includes("Quick Express"));
  assert.ok(COURIER_PRESETS.includes("Colis Express"));
});

test("Return reasons cover essential COD return scenarios", () => {
  assert.ok(RETURN_REASONS.includes("Customer Refused on Delivery"));
  assert.ok(RETURN_REASONS.includes("Unreachable / Wrong Phone"));
  assert.ok(RETURN_REASONS.includes("Wrong Address / Incomplete"));
  assert.ok(RETURN_REASONS.includes("Damaged in Transit"));
});

test("validateReconciliation approves valid single dispatch update", () => {
  const res = validateReconciliation({
    status: "DISPATCHED",
    courier_name: "Aramex Tunisia",
    tracking_code: "ARX-TN-98214",
    notes: "Driver pickup at 2 PM",
  });
  assert.equal(res.valid, true);
  assert.equal(res.data.status, "DISPATCHED");
  assert.equal(res.data.courier_name, "Aramex Tunisia");
  assert.equal(res.data.tracking_code, "ARX-TN-98214");
});

test("validateReconciliation marks order DELIVERED cleanly", () => {
  const res = validateReconciliation({
    status: "DELIVERED",
    courier_name: "First Delivery Express",
    tracking_code: "FDX-77412",
  });
  assert.equal(res.valid, true);
  assert.equal(res.data.status, "DELIVERED");
});

test("validateReconciliation validates returned orders with return reason and fee", () => {
  const res = validateReconciliation({
    status: "RETURNED",
    courier_name: "Aramex Tunisia",
    tracking_code: "ARX-TN-98214",
    return_reason: "Customer Refused on Delivery",
    return_fee: 3.5,
  });
  assert.equal(res.valid, true);
  assert.equal(res.data.status, "RETURNED");
  assert.equal(res.data.return_reason, "Customer Refused on Delivery");
  assert.equal(res.data.return_fee, 3.5);
});

test("validateReconciliation rejects negative return fees", () => {
  const res = validateReconciliation({
    status: "RETURNED",
    return_reason: "Customer Refused on Delivery",
    return_fee: -5.0,
  });
  assert.equal(res.valid, false);
});

test("validateBatchDispatch approves bulk dispatch payload", () => {
  const res = validateBatchDispatch({
    order_ids: ["ord-1", "ord-2", "ord-3"],
    courier_name: "Maystro Delivery",
    notes: "Batch #104",
  });
  assert.equal(res.valid, true);
  assert.equal(res.data.order_ids.length, 3);
  assert.equal(res.data.courier_name, "Maystro Delivery");
});

test("validateBatchDispatch rejects empty order IDs list", () => {
  const res = validateBatchDispatch({
    order_ids: [],
    courier_name: "Aramex Tunisia",
  });
  assert.equal(res.valid, false);
});

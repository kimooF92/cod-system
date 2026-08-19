const test = require("node:test");
const assert = require("node:assert/strict");

function sanitizeTunisianPhone(raw) {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00216")) {
    digits = digits.slice(5);
  } else if (digits.startsWith("216")) {
    digits = digits.slice(3);
  }
  return digits;
}

function isValidTunisianPhone(phone) {
  const sanitized = sanitizeTunisianPhone(phone);
  return /^[234579]\d{7}$/.test(sanitized);
}

function calculateOrderTotal(quantity, unitPrice, deliveryFee) {
  return quantity * unitPrice + deliveryFee;
}

test("sanitizeTunisianPhone normalizes diverse phone formats", () => {
  assert.equal(sanitizeTunisianPhone("+216 20 123 456"), "20123456");
  assert.equal(sanitizeTunisianPhone("00216 50 999 888"), "50999888");
  assert.equal(sanitizeTunisianPhone("98-112-233"), "98112233");
  assert.equal(sanitizeTunisianPhone("22345678"), "22345678");
});

test("isValidTunisianPhone validates genuine Tunisian numbers", () => {
  assert.equal(isValidTunisianPhone("20123456"), true);
  assert.equal(isValidTunisianPhone("+21650999888"), true);
  assert.equal(isValidTunisianPhone("98112233"), true);
  assert.equal(isValidTunisianPhone("12345678"), false); // 1 is invalid prefix
  assert.equal(isValidTunisianPhone("20123"), false); // too short
  assert.equal(isValidTunisianPhone("20123456789"), false); // too long
});

test("calculateOrderTotal computes quantity, unit price and delivery fee accurately", () => {
  const totalSingle = calculateOrderTotal(1, 49.0, 7.0);
  assert.equal(totalSingle, 56.0);

  const totalDouble = calculateOrderTotal(2, 69.0, 7.0);
  assert.equal(totalDouble, 145.0);
});

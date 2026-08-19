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

function generateWhatsAppMessage(key, data) {
  const cleanPhone = sanitizeTunisianPhone(data.phone);
  let messageText = "";

  switch (key) {
    case "DERJA_CONFIRM":
      messageText = `عسلامة ${data.customerName} 👋
نكلموك بخصوص كموندك #${data.orderNumber} متاع:
📦 المنتج: ${data.productName}
🔢 الكمية: ${data.quantity}
💰 المجموع: ${data.totalAmount} DT
📍 العنوان: ${data.governorate}`;
      break;

    case "FRENCH_CONFIRM":
      messageText = `Bonjour ${data.customerName} 👋
Confirmation de commande #${data.orderNumber} :
📦 Produit : ${data.productName}
💰 Total : ${data.totalAmount} DT`;
      break;

    case "NO_ANSWER_FOLLOWUP":
      messageText = `عسلامة ${data.customerName} 👋
حاولنا نطلبوك في الهاتف بخصوص كموندك #${data.orderNumber}`;
      break;
  }

  const encoded = encodeURIComponent(messageText);
  const url = `https://wa.me/216${cleanPhone}?text=${encoded}`;

  return {
    templateKey: key,
    messageText,
    url,
  };
}

test("generateWhatsAppMessage formats Derja template and valid wa.me URL", () => {
  const result = generateWhatsAppMessage("DERJA_CONFIRM", {
    customerName: "Mohamed Ali",
    phone: "+216 20 123 456",
    orderNumber: "ORD-2026-00101",
    productName: "Phone Mount",
    quantity: 1,
    totalAmount: 56.0,
    governorate: "Tunis",
  });

  assert.equal(result.url.startsWith("https://wa.me/21620123456?text="), true);
  assert.equal(result.messageText.includes("Mohamed Ali"), true);
  assert.equal(result.messageText.includes("ORD-2026-00101"), true);
  assert.equal(result.messageText.includes("Phone Mount"), true);
});

test("generateWhatsAppMessage formats French template correctly", () => {
  const result = generateWhatsAppMessage("FRENCH_CONFIRM", {
    customerName: "Yassine",
    phone: "50999888",
    orderNumber: "ORD-2026-00102",
    productName: "Memory Cushion",
    quantity: 2,
    totalAmount: 145.0,
    governorate: "Sousse",
  });

  assert.equal(result.url.startsWith("https://wa.me/21650999888?text="), true);
  assert.equal(result.messageText.includes("Bonjour Yassine"), true);
});

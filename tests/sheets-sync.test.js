const test = require("node:test");
const assert = require("node:assert/strict");

const TUNISIAN_GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
  "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba",
  "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana",
  "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
];

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

function normalizeGovernorate(raw) {
  if (!raw) return "Tunis";
  const clean = raw.trim().toLowerCase();

  for (const gov of TUNISIAN_GOVERNORATES) {
    if (gov.toLowerCase() === clean) return gov;
  }

  const simplified = clean
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_]/g, " ");

  if (simplified.includes("tunis") || simplified === "capital") return "Tunis";
  if (simplified.includes("ariana")) return "Ariana";
  if (simplified.includes("ben arous")) return "Ben Arous";
  if (simplified.includes("manouba")) return "La Manouba";
  if (simplified.includes("nabeul") || simplified.includes("hammamet")) return "Nabeul";
  if (simplified.includes("sousse") || simplified.includes("khezama")) return "Sousse";
  if (simplified.includes("monastir") || simplified.includes("sahline")) return "Monastir";
  if (simplified.includes("mahdia")) return "Mahdia";
  if (simplified.includes("sfax")) return "Sfax";
  if (simplified.includes("bizerte")) return "Bizerte";
  if (simplified.includes("beja")) return "Béja";
  if (simplified.includes("jendouba") || simplified.includes("tabarka")) return "Jendouba";
  if (simplified.includes("kef")) return "Le Kef";
  if (simplified.includes("siliana")) return "Siliana";
  if (simplified.includes("kairouan")) return "Kairouan";
  if (simplified.includes("kasserine")) return "Kasserine";
  if (simplified.includes("sidi bouzid")) return "Sidi Bouzid";
  if (simplified.includes("gabes")) return "Gabès";
  if (simplified.includes("medenine") || simplified.includes("djerba") || simplified.includes("zarzis")) return "Médenine";
  if (simplified.includes("tataouine")) return "Tataouine";
  if (simplified.includes("gafsa")) return "Gafsa";
  if (simplified.includes("tozeur")) return "Tozeur";
  if (simplified.includes("kebili") || simplified.includes("douz")) return "Kébili";
  if (simplified.includes("zaghouan")) return "Zaghouan";

  return "Tunis";
}

function parseDelimitedText(text) {
  if (!text || text.trim() === "") return { headers: [], rows: [] };
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  const firstLine = lines[0];
  const isTab = firstLine.includes("\t") && firstLine.split("\t").length > firstLine.split(",").length;
  const delimiter = isTab ? "\t" : ",";

  const splitLine = (line) => {
    if (isTab) return line.split("\t").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    const tokens = [];
    let current = "";
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === delimiter && !insideQuotes) {
        tokens.push(current.trim().replace(/^["']|["']$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    tokens.push(current.trim().replace(/^["']|["']$/g, ""));
    return tokens;
  };

  const headers = splitLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;
    const values = splitLine(rawLine);
    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] || "";
    });
    rows.push(rowObj);
  }
  return { headers, rows };
}

function processSheetSyncRows(rows, mapping, existingOrders, defaultProductId = "prod-1", defaultUnitPrice = 49.0) {
  const existingSet = new Set();
  existingOrders.forEach((o) => {
    const cleanPhone = sanitizeTunisianPhone(o.phone);
    existingSet.add(`${cleanPhone}_${o.product_id}`);
  });

  const validOrders = [];
  let skippedDuplicates = 0;
  let invalidRows = 0;
  const details = [];

  for (const row of rows) {
    const errors = [];
    const rawName = (row[mapping.customerNameCol] || "").trim();
    const rawPhone = (row[mapping.phoneCol] || "").trim();
    const rawGov = (row[mapping.governorateCol] || "").trim();
    const rawAddress = (row[mapping.addressCol] || "").trim();
    const rawProduct = mapping.productCol ? (row[mapping.productCol] || "").trim() : "";
    const rawQty = mapping.quantityCol ? parseInt(row[mapping.quantityCol] || "1", 10) : 1;
    const rawPrice = mapping.unitPriceCol ? parseFloat(row[mapping.unitPriceCol] || String(defaultUnitPrice)) : defaultUnitPrice;

    if (!rawName || rawName.length < 2) {
      errors.push("Customer name missing or too short");
    }

    const sanitizedPhone = sanitizeTunisianPhone(rawPhone);
    if (!isValidTunisianPhone(sanitizedPhone)) {
      errors.push(`Invalid Tunisian phone number (${rawPhone})`);
    }

    const governorate = normalizeGovernorate(rawGov);
    const address = rawAddress || `Centre Ville, ${governorate}`;
    const productId = rawProduct || defaultProductId;
    const quantity = isNaN(rawQty) || rawQty < 1 ? 1 : rawQty;
    const unitPrice = isNaN(rawPrice) || rawPrice <= 0 ? defaultUnitPrice : rawPrice;

    const dedupeKey = `${sanitizedPhone}_${productId}`;
    const isDuplicate = existingSet.has(dedupeKey);

    if (errors.length > 0) {
      invalidRows++;
      details.push({ raw: row, isValid: false, isDuplicate: false, errors });
      continue;
    }

    if (isDuplicate) {
      skippedDuplicates++;
      details.push({ raw: row, isValid: true, isDuplicate: true, errors: ["Duplicate lead"] });
      continue;
    }

    existingSet.add(dedupeKey);

    const orderInput = {
      customer_name: rawName,
      phone: sanitizedPhone,
      governorate,
      address,
      product_id: productId,
      quantity,
      unit_price: unitPrice,
      delivery_fee: 7.0,
      source: "Google Sheets",
      notes: "Synced via Google Sheets",
    };

    validOrders.push(orderInput);
    details.push({ raw: row, normalized: orderInput, isValid: true, isDuplicate: false, errors: [] });
  }

  return {
    totalRows: rows.length,
    validOrders,
    skippedDuplicates,
    invalidRows,
    details,
  };
}

test("parseDelimitedText accurately parses TSV and CSV input", () => {
  const tsv = "Name\tPhone\tCity\nAmine\t22345678\tTunis\nSarra\t50123456\tSousse";
  const resTsv = parseDelimitedText(tsv);
  assert.equal(resTsv.headers.length, 3);
  assert.equal(resTsv.rows.length, 2);
  assert.equal(resTsv.rows[0].Name, "Amine");
  assert.equal(resTsv.rows[0].Phone, "22345678");

  const csv = "Name,Phone,City\nMohamed,98112233,Sfax";
  const resCsv = parseDelimitedText(csv);
  assert.equal(resCsv.headers.length, 3);
  assert.equal(resCsv.rows.length, 1);
  assert.equal(resCsv.rows[0].City, "Sfax");
});

test("normalizeGovernorate normalizes aliases and fuzzy regions", () => {
  assert.equal(normalizeGovernorate("sousse ville"), "Sousse");
  assert.equal(normalizeGovernorate("djerba"), "Médenine");
  assert.equal(normalizeGovernorate("tabarka"), "Jendouba");
  assert.equal(normalizeGovernorate("beja"), "Béja");
  assert.equal(normalizeGovernorate("hammamet"), "Nabeul");
  assert.equal(normalizeGovernorate(""), "Tunis");
});

test("processSheetSyncRows extracts valid orders, sanitizes phones, and deduplicates", () => {
  const rows = [
    { FullName: "Kais Saied", Telephone: "+216 20 123 456", Gov: "Tunis", Rue: "Carthage" },
    { FullName: "Houssem Trabelsi", Telephone: "50 999 888", Gov: "Sousse", Rue: "Khezama" },
    { FullName: "Kais Saied", Telephone: "20123456", Gov: "Tunis", Rue: "Carthage" }, // Duplicate of row 1
    { FullName: "Bad Number", Telephone: "123456", Gov: "Sfax", Rue: "Center" }, // Invalid phone
  ];

  const existingOrders = [
    { phone: "50999888", product_id: "prod-1" }, // Matches row 2
  ];

  const mapping = {
    customerNameCol: "FullName",
    phoneCol: "Telephone",
    governorateCol: "Gov",
    addressCol: "Rue",
  };

  const result = processSheetSyncRows(rows, mapping, existingOrders, "prod-1", 49.0);

  // Total: 4 rows
  assert.equal(result.totalRows, 4);
  // Valid new orders: row 1 only
  assert.equal(result.validOrders.length, 1);
  assert.equal(result.validOrders[0].customer_name, "Kais Saied");
  assert.equal(result.validOrders[0].phone, "20123456");
  assert.equal(result.validOrders[0].governorate, "Tunis");

  // Duplicates: row 2 (in DB) + row 3 (intra-sheet duplicate of row 1)
  assert.equal(result.skippedDuplicates, 2);

  // Invalid: row 4
  assert.equal(result.invalidRows, 1);
});

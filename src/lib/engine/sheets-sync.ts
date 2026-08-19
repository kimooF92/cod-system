/**
 * COD Growth OS — Google Sheets Order Sync Engine (AD-1)
 * Invariant: Pure TypeScript logic, zero DB dependencies, idempotent deduplication, unit-safe math.
 */

import {
  sanitizeTunisianPhone,
  isValidTunisianPhone,
  TUNISIAN_GOVERNORATES,
  type TunisianGovernorate,
  type OrderInput,
} from "../validations/order";

export interface SheetColumnMapping {
  customerNameCol: string;
  phoneCol: string;
  governorateCol: string;
  addressCol: string;
  productCol?: string;
  quantityCol?: string;
  unitPriceCol?: string;
  deliveryFeeCol?: string;
  sourceCol?: string;
  notesCol?: string;
}

export interface ParsedSheetRow {
  raw: Record<string, string>;
  normalized?: OrderInput;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
}

export interface SyncResult {
  totalRows: number;
  validOrders: OrderInput[];
  skippedDuplicates: number;
  invalidRows: number;
  details: ParsedSheetRow[];
}

/**
 * Normalizes user-entered governorate names into official Tunisian governorate strings
 */
export function normalizeGovernorate(raw: string): TunisianGovernorate {
  if (!raw) return "Tunis";
  const clean = raw.trim().toLowerCase();

  // Direct case-insensitive match
  for (const gov of TUNISIAN_GOVERNORATES) {
    if (gov.toLowerCase() === clean) return gov;
  }

  // Substring / Accent insensitive match
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

/**
 * Parses raw CSV/TSV content into an array of objects
 */
export function parseDelimitedText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  if (!text || text.trim() === "") {
    return { headers: [], rows: [] };
  }

  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Detect delimiter: tab or comma
  const firstLine = lines[0];
  const isTab = firstLine.includes("\t") && firstLine.split("\t").length > firstLine.split(",").length;
  const delimiter = isTab ? "\t" : ",";

  const splitLine = (line: string): string[] => {
    if (isTab) return line.split("\t").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    // Simple comma CSV parser handling basic quotes
    const tokens: string[] = [];
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
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;
    const values = splitLine(rawLine);
    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] || "";
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Normalizes and deduplicates sheet rows against existing database orders (FR-26, ARCH-4)
 */
export function processSheetSyncRows(
  rows: Record<string, string>[],
  mapping: SheetColumnMapping,
  existingOrders: { phone: string; product_id: string; created_at?: string }[],
  defaultProductId: string = "prod-1",
  defaultUnitPrice: number = 49.0
): SyncResult {
  const existingSet = new Set<string>();
  existingOrders.forEach((o) => {
    const cleanPhone = sanitizeTunisianPhone(o.phone);
    existingSet.add(`${cleanPhone}_${o.product_id}`);
  });

  const validOrders: OrderInput[] = [];
  let skippedDuplicates = 0;
  let invalidRows = 0;
  const details: ParsedSheetRow[] = [];

  for (const row of rows) {
    const errors: string[] = [];
    const rawName = (row[mapping.customerNameCol] || "").trim();
    const rawPhone = (row[mapping.phoneCol] || "").trim();
    const rawGov = (row[mapping.governorateCol] || "").trim();
    const rawAddress = (row[mapping.addressCol] || "").trim();
    const rawProduct = mapping.productCol ? (row[mapping.productCol] || "").trim() : "";
    const rawQty = mapping.quantityCol ? parseInt(row[mapping.quantityCol] || "1", 10) : 1;
    const rawPrice = mapping.unitPriceCol ? parseFloat(row[mapping.unitPriceCol] || String(defaultUnitPrice)) : defaultUnitPrice;
    const rawFee = mapping.deliveryFeeCol ? parseFloat(row[mapping.deliveryFeeCol] || "7.0") : 7.0;
    const rawSource = mapping.sourceCol ? (row[mapping.sourceCol] || "Google Sheets").trim() : "Google Sheets";
    const rawNotes = mapping.notesCol ? (row[mapping.notesCol] || "").trim() : "";

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
    const deliveryFee = isNaN(rawFee) || rawFee < 0 ? 7.0 : rawFee;

    const dedupeKey = `${sanitizedPhone}_${productId}`;
    const isDuplicate = existingSet.has(dedupeKey);

    if (errors.length > 0) {
      invalidRows++;
      details.push({
        raw: row,
        isValid: false,
        isDuplicate: false,
        errors,
      });
      continue;
    }

    if (isDuplicate) {
      skippedDuplicates++;
      details.push({
        raw: row,
        isValid: true,
        isDuplicate: true,
        errors: ["Duplicate lead: Order already exists for this phone and product"],
      });
      continue;
    }

    // Add to in-flight set to catch intra-sheet duplicates
    existingSet.add(dedupeKey);

    const orderInput: OrderInput = {
      customer_name: rawName,
      phone: sanitizedPhone,
      governorate,
      address,
      product_id: productId,
      quantity,
      unit_price: unitPrice,
      delivery_fee: deliveryFee,
      source: rawSource || "Google Sheets",
      notes: rawNotes ? `[Synced from Sheets] ${rawNotes}` : "Synced via Google Sheets Integration",
    };

    validOrders.push(orderInput);
    details.push({
      raw: row,
      normalized: orderInput,
      isValid: true,
      isDuplicate: false,
      errors: [],
    });
  }

  return {
    totalRows: rows.length,
    validOrders,
    skippedDuplicates,
    invalidRows,
    details,
  };
}

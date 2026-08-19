import { NextResponse } from "next/server";
import { syncExternalOrders, getOrders } from "@/actions/orders";
import {
  processSheetSyncRows,
  type SheetColumnMapping,
} from "@/lib/engine/sheets-sync";

/**
 * Webhook Route Handler for real-time lead sync from Google Apps Script, Shopify, YouCan, or Webhooks (ARCH-4)
 * URL: POST /api/sync/orders
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support both direct array of rows and single row object
    let rows: Record<string, string>[] = [];
    if (Array.isArray(body)) {
      rows = body;
    } else if (body.orders && Array.isArray(body.orders)) {
      rows = body.orders;
    } else if (typeof body === "object") {
      rows = [body];
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Empty or invalid order payload" },
        { status: 400 }
      );
    }

    // Default column mapping for standard webhook fields
    const mapping: SheetColumnMapping = {
      customerNameCol: "customer_name",
      phoneCol: "phone",
      governorateCol: "governorate",
      addressCol: "address",
      productCol: "product_id",
      quantityCol: "quantity",
      unitPriceCol: "unit_price",
      deliveryFeeCol: "delivery_fee",
      sourceCol: "source",
      notesCol: "notes",
    };

    // Auto-adapt if keys are uppercase or varied (e.g. "Full Name", "Telephone")
    const sample = rows[0];
    for (const key of Object.keys(sample)) {
      const lower = key.toLowerCase();
      if (lower.includes("name") || lower.includes("nom") || lower.includes("client")) {
        mapping.customerNameCol = key;
      } else if (lower.includes("phone") || lower.includes("tel") || lower.includes("num")) {
        mapping.phoneCol = key;
      } else if (lower.includes("gov") || lower.includes("ville") || lower.includes("city")) {
        mapping.governorateCol = key;
      } else if (lower.includes("address") || lower.includes("adresse")) {
        mapping.addressCol = key;
      }
    }

    const existingOrders = await getOrders();
    const result = processSheetSyncRows(rows, mapping, existingOrders);

    if (result.validOrders.length > 0) {
      await syncExternalOrders(result.validOrders);
    }

    return NextResponse.json({
      success: true,
      totalReceived: rows.length,
      createdCount: result.validOrders.length,
      skippedDuplicates: result.skippedDuplicates,
      invalidRows: result.invalidRows,
      message: `Successfully synced ${result.validOrders.length} orders (${result.skippedDuplicates} duplicates skipped).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process webhook order sync" },
      { status: 500 }
    );
  }
}

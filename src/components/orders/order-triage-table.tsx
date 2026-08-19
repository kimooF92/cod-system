"use client";

import * as React from "react";
import {
  ShoppingBag,
  Plus,
  Search,
  Phone,
  MapPin,
  Trash2,
  Filter,
  DollarSign,
  Package,
  Calendar,
  MessageSquare,
  CheckCircle2,
  PhoneCall,
  PhoneOff,
  Truck,
  Check,
  RotateCcw,
  XCircle,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getOrders,
  updateOrderStatus,
  batchUpdateOrderStatus,
  deleteOrder,
  type Order,
} from "@/actions/orders";
import { getProducts, type Product } from "@/actions/products";
import {
  TUNISIAN_GOVERNORATES,
  type OrderStatus,
} from "@/lib/validations/order";
import { isFollowUpDue } from "@/lib/engine/followup-rules";
import { OrderFormDialog } from "./order-form-dialog";
import { WhatsAppDialog } from "./whatsapp-dialog";
import { CallAttemptDialog } from "./call-attempt-dialog";
import { CourierReconciliationDialog } from "./courier-reconciliation-dialog";
import { BatchDispatchDialog } from "./batch-dispatch-dialog";
import { FollowUpQueueBanner } from "./followup-queue-banner";
import { OperationalRatesBar } from "./operational-rates-bar";
import { SheetsSyncDialog } from "./sheets-sync-dialog";

interface OrderTriageTableProps {
  initialOrders: Order[];
}

const statusBadges: Record<string, { bg: string; text: string; border: string; label: string }> = {
  NEW_ORDER: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    label: "NEW ORDER",
  },
  CONFIRMED: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    label: "CONFIRMED",
  },
  DISPATCHED: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    label: "DISPATCHED",
  },
  DELIVERED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    label: "DELIVERED",
  },
  RETURNED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    label: "RETURNED",
  },
  CANCELLED: {
    bg: "bg-surface-subtle",
    text: "text-muted-foreground",
    border: "border-border",
    label: "CANCELLED",
  },
  NO_ANSWER: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    label: "NO ANSWER",
  },
};

export function OrderTriageTable({ initialOrders }: OrderTriageTableProps) {
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState("ALL");
  const [selectedGov, setSelectedGov] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");
  const [isDueOnly, setIsDueOnly] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Selection for Batch Actions
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Dialog states
  const [isOrderDialogOpen, setIsOrderDialogOpen] = React.useState(false);
  const [whatsAppOrder, setWhatsAppOrder] = React.useState<Order | null>(null);
  const [callAttemptOrder, setCallAttemptOrder] = React.useState<Order | null>(null);
  const [reconciliationOrder, setReconciliationOrder] = React.useState<Order | null>(null);
  const [isBatchDispatchOpen, setIsBatchDispatchOpen] = React.useState(false);
  const [isSheetsSyncOpen, setIsSheetsSyncOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const fetchOrders = async (
    prodId = selectedProductId,
    gov = selectedGov,
    status = selectedStatus
  ) => {
    setLoading(true);
    const data = await getOrders({
      productId: prodId !== "ALL" ? prodId : undefined,
      governorate: gov !== "ALL" ? gov : undefined,
      status: status !== "ALL" ? status : undefined,
    });
    setOrders(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    await updateOrderStatus(id, newStatus);
    fetchOrders();
  };

  const handleBatchUpdate = async (newStatus: OrderStatus) => {
    if (selectedIds.length === 0) return;
    await batchUpdateOrderStatus(selectedIds, newStatus);
    setSelectedIds([]);
    fetchOrders();
  };

  const handleDelete = async (id: string, orderNumber: string) => {
    if (confirm(`Delete order ${orderNumber}?`)) {
      await deleteOrder(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      fetchOrders();
    }
  };

  const toggleSelectAll = (filtered: Order[]) => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((o) => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (isDueOnly) {
      if (o.status !== "NO_ANSWER" || !isFollowUpDue(o.next_follow_up_at)) {
        return false;
      }
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.governorate.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q) ||
      (o.product?.name && o.product.name.toLowerCase().includes(q))
    );
  });

  const newOrdersCount = orders.filter((o) => o.status === "NEW_ORDER").length;
  const noAnswerCount = orders.filter((o) => o.status === "NO_ANSWER").length;
  const dueCallbacksCount = orders.filter(
    (o) => o.status === "NO_ANSWER" && isFollowUpDue(o.next_follow_up_at)
  ).length;
  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            COD Order Management &amp; Triage Cockpit
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Follow-up scheduling, 1-click WhatsApp &amp; 3-attempt strike rules
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsSheetsSyncOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-surface-subtle hover:bg-surface border border-border text-foreground text-xs font-semibold transition-colors shadow-sm"
            title="Import live leads from Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Sync Google Sheet</span>
          </button>

          <button
            onClick={() => setIsOrderDialogOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New COD Order</span>
          </button>
        </div>
      </div>

      {/* Live Operational Rates & Fulfillment Cockpit (Story 3.5) */}
      <OperationalRatesBar orders={orders} products={products} />

      {/* Follow-Up & Max Attempts Action Banner */}
      <FollowUpQueueBanner
        orders={orders}
        onSelectDueFilter={() => setIsDueOnly(true)}
        onRefresh={() => fetchOrders()}
      />

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">New to Call</span>
            <p className="text-lg font-mono font-bold text-blue-400 tabular-nums">
              {newOrdersCount}
            </p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">No Answer / Due</span>
            <p className="text-lg font-mono font-bold text-amber-400 tabular-nums">
              {noAnswerCount} {dueCallbacksCount > 0 && <span className="text-xs text-red-400">({dueCallbacksCount} due)</span>}
            </p>
          </div>
          <PhoneOff className="w-4 h-4 text-amber-400 opacity-80" />
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Confirmed &amp; Ready</span>
            <p className="text-lg font-mono font-bold text-purple-400 tabular-nums">
              {confirmedCount}
            </p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-purple-400 opacity-80" />
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Delivered</span>
            <p className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
              {deliveredCount}
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">PAID</span>
        </div>
      </div>

      {/* Batch Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
            <span>{selectedIds.length} orders selected:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsBatchDispatchOpen(true)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-sm"
              title="Bulk assign courier and dispatch"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Batch Courier Dispatch</span>
            </button>

            <button
              onClick={() => handleBatchUpdate("CONFIRMED")}
              className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Confirmed</span>
            </button>

            <button
              onClick={() => handleBatchUpdate("DISPATCHED")}
              className="flex items-center gap-1 px-3 py-1 rounded bg-amber-600/80 hover:bg-amber-700 text-white text-xs font-medium transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Mark Dispatched</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 rounded border border-border text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Filter Row & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Due Callback Toggle */}
          <button
            onClick={() => setIsDueOnly(!isDueOnly)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isDueOnly
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                : "bg-surface text-muted-foreground border border-border hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Due Follow-Ups {dueCallbacksCount > 0 && `(${dueCallbacksCount})`}</span>
          </button>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setIsDueOnly(false);
              fetchOrders(selectedProductId, selectedGov, e.target.value);
            }}
            className="px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs font-mono text-foreground focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW_ORDER">NEW ORDER</option>
            <option value="NO_ANSWER">NO ANSWER</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="DISPATCHED">DISPATCHED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="RETURNED">RETURNED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {/* Governorate Filter */}
          <select
            value={selectedGov}
            onChange={(e) => {
              setSelectedGov(e.target.value);
              fetchOrders(selectedProductId, e.target.value, selectedStatus);
            }}
            className="px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs font-mono text-foreground focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Governorates (24)</option>
            {TUNISIAN_GOVERNORATES.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>

          {/* Product Filter */}
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              fetchOrders(e.target.value, selectedGov, selectedStatus);
            }}
            className="px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs font-mono text-foreground focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* High-Density Triage Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-muted-foreground">
            Loading order triage queue...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-surface-subtle border border-border flex items-center justify-center text-muted-foreground mx-auto">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                {searchQuery
                  ? `No orders matching "${searchQuery}"`
                  : isDueOnly
                  ? "All callbacks up to date! 🎉"
                  : orders.length === 0
                  ? "No orders yet"
                  : "No orders match the current filters"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {orders.length === 0
                  ? "Log your first COD order manually or sync from a Google Sheet."
                  : searchQuery
                  ? "Try a different search term or clear filters."
                  : "Adjust the filters above to see more orders."}
              </p>
            </div>
            {orders.length === 0 && (
              <button
                onClick={() => setIsOrderDialogOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Log First Order
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-subtle text-muted-foreground text-[10px] uppercase border-b border-border">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredOrders.length &&
                        filteredOrders.length > 0
                      }
                      onChange={() => toggleSelectAll(filteredOrders)}
                      className="rounded border-border cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Order #</th>
                  <th className="py-3 px-3">Customer &amp; Phone</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Product &amp; Qty</th>
                  <th className="py-3 px-3 text-right">Cash Due</th>
                  <th className="py-3 px-3 text-center">Status &amp; Attempts</th>
                  <th className="py-3 px-3 text-center">Quick Actions</th>
                  <th className="py-3 px-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  const style = statusBadges[order.status] || statusBadges.NEW_ORDER;
                  const isSelected = selectedIds.includes(order.id);
                  const isDue = order.status === "NO_ANSWER" && isFollowUpDue(order.next_follow_up_at);
                  const maxReached = order.attempt_count >= 3;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-surface-subtle/50 transition-colors ${
                        isSelected ? "bg-blue-600/5" : isDue ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(order.id)}
                          className="rounded border-border cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3 font-bold text-foreground whitespace-nowrap">
                        {order.order_number}
                        {order.attempt_count > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                                maxReached
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-surface-subtle text-muted-foreground border border-border"
                              }`}
                            >
                              Attempt {order.attempt_count}/3 {maxReached ? "MAX" : ""}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">
                          {order.customer_name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <a
                            href={`tel:${order.phone}`}
                            className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>{order.phone}</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setWhatsAppOrder(order)}
                            className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold hover:bg-emerald-500/25 transition-colors"
                            title="1-Click WhatsApp confirmation"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>WA</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{order.governorate}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {order.address}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">
                          {order.product?.name || "Product"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Qty: {order.quantity} &bull; {formatCurrency(order.unit_price)}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                        {formatCurrency(order.total_amount)}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {style.label}
                          </span>

                          {order.courier_name && (
                            <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1 bg-surface-subtle px-1.5 py-0.5 rounded border border-border">
                              <Truck className="w-2.5 h-2.5 text-amber-400" />
                              <span>{order.courier_name}</span>
                              {order.tracking_code && (
                                <span className="text-foreground font-semibold">({order.tracking_code})</span>
                              )}
                            </span>
                          )}

                          {order.status === "RETURNED" && order.return_reason && (
                            <span className="text-[9px] font-mono text-red-400 max-w-[140px] truncate" title={order.return_reason}>
                              {order.return_reason} (-{formatCurrency(Number(order.return_fee || 3.5))})
                            </span>
                          )}

                          {isDue && (
                            <span className="block text-[9px] font-mono text-red-400 font-bold animate-pulse">
                              CALL DUE NOW
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Inline Quick Action Buttons */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {order.status === "NEW_ORDER" || order.status === "NO_ANSWER" ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(order.id, "CONFIRMED")}
                                className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold transition-colors"
                                title="Mark Confirmed"
                              >
                                Confirm
                              </button>

                              {maxReached ? (
                                <button
                                  onClick={() => handleStatusChange(order.id, "CANCELLED")}
                                  className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-[10px] font-bold transition-colors"
                                  title="Cancel after 3 failed call attempts"
                                >
                                  Cancel (3 Strikes)
                                </button>
                              ) : (
                                <button
                                  onClick={() => setCallAttemptOrder(order)}
                                  className="px-1.5 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[10px] transition-colors flex items-center gap-0.5"
                                  title="Log No Answer attempt and schedule callback"
                                >
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Retry</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleStatusChange(order.id, "CANCELLED")}
                                className="px-1.5 py-0.5 rounded bg-surface-subtle hover:bg-surface text-muted-foreground border border-border text-[10px] transition-colors"
                                title="Cancel Order"
                              >
                                Cancel
                              </button>
                            </>
                          ) : order.status === "CONFIRMED" ? (
                            <>
                              <button
                                onClick={() => setReconciliationOrder(order)}
                                className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[10px] font-semibold transition-colors flex items-center gap-1"
                                title="Assign Courier and Dispatch"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Dispatch</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(order.id, "CANCELLED")}
                                className="px-1.5 py-0.5 rounded text-muted-foreground text-[10px]"
                              >
                                Cancel
                              </button>
                            </>
                          ) : order.status === "DISPATCHED" ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(order.id, "DELIVERED")}
                                className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold transition-colors flex items-center gap-0.5"
                                title="Mark Delivered & Paid"
                              >
                                <Check className="w-2.5 h-2.5" />
                                <span>Delivered</span>
                              </button>
                              <button
                                onClick={() => setReconciliationOrder(order)}
                                className="px-1.5 py-0.5 rounded bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-[10px] transition-colors flex items-center gap-0.5"
                                title="Log Return with Reason and Return Fee"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Return</span>
                              </button>
                              <button
                                onClick={() => setReconciliationOrder(order)}
                                className="px-1.5 py-0.5 rounded bg-surface-subtle hover:bg-surface text-muted-foreground border border-border text-[10px]"
                                title="Edit Courier / Manifest Details"
                              >
                                Edit
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setReconciliationOrder(order)}
                              className="px-2 py-0.5 rounded bg-surface-subtle hover:bg-surface text-muted-foreground border border-border text-[10px] transition-colors"
                              title="Reconcile / Edit Details"
                            >
                              Reconcile
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDelete(order.id, order.order_number)}
                          className="p-1 text-muted-foreground hover:text-red-400 rounded transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Creation Dialog */}
      <OrderFormDialog
        isOpen={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
        onSuccess={() => fetchOrders(selectedProductId, selectedGov, selectedStatus)}
      />

      {/* 1-Click WhatsApp Modal */}
      <WhatsAppDialog
        order={whatsAppOrder}
        isOpen={!!whatsAppOrder}
        onClose={() => setWhatsAppOrder(null)}
      />

      {/* Call Attempt & Schedule Dialog */}
      <CallAttemptDialog
        order={callAttemptOrder}
        isOpen={!!callAttemptOrder}
        onClose={() => setCallAttemptOrder(null)}
        onSuccess={() => fetchOrders(selectedProductId, selectedGov, selectedStatus)}
      />

      {/* Courier Reconciliation Dialog (Story 3.4) */}
      <CourierReconciliationDialog
        order={reconciliationOrder}
        isOpen={!!reconciliationOrder}
        onClose={() => setReconciliationOrder(null)}
        onSuccess={() => fetchOrders(selectedProductId, selectedGov, selectedStatus)}
      />

      {/* Batch Dispatch Dialog (Story 3.4) */}
      <BatchDispatchDialog
        selectedOrders={orders.filter((o) => selectedIds.includes(o.id))}
        isOpen={isBatchDispatchOpen}
        onClose={() => setIsBatchDispatchOpen(false)}
        onSuccess={() => {
          setSelectedIds([]);
          fetchOrders(selectedProductId, selectedGov, selectedStatus);
        }}
      />

      {/* Google Sheets Sync Dialog (Story 3.6) */}
      <SheetsSyncDialog
        isOpen={isSheetsSyncOpen}
        onClose={() => setIsSheetsSyncOpen(false)}
        onSuccess={() => fetchOrders(selectedProductId, selectedGov, selectedStatus)}
        existingOrders={orders}
        products={products}
      />
    </div>
  );
}

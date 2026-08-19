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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getOrders, deleteOrder, type Order } from "@/actions/orders";
import { getProducts, type Product } from "@/actions/products";
import { TUNISIAN_GOVERNORATES } from "@/lib/validations/order";
import { OrderFormDialog } from "./order-form-dialog";

interface OrderTableProps {
  initialOrders: Order[];
}

const statusBadges: Record<string, { bg: string; text: string; border: string }> = {
  NEW_ORDER: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  CONFIRMED: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  DISPATCHED: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  DELIVERED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  RETURNED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
  CANCELLED: {
    bg: "bg-surface-subtle",
    text: "text-muted-foreground",
    border: "border-border",
  },
  NO_ANSWER: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
};

export function OrderTable({ initialOrders }: OrderTableProps) {
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState("ALL");
  const [selectedGov, setSelectedGov] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
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

  const handleDelete = async (id: string, orderNumber: string) => {
    if (confirm(`Delete order ${orderNumber}?`)) {
      await deleteOrder(id);
      fetchOrders(selectedProductId, selectedGov, selectedStatus);
    }
  };

  const filteredOrders = orders.filter((o) => {
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

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const newOrdersCount = orders.filter((o) => o.status === "NEW_ORDER").length;
  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            COD Order Management &amp; Triage
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rapid manual intake, Tunisian phone validation &amp; delivery tracking
          </p>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New COD Order</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">New Orders to Call</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-lg font-mono font-bold text-blue-400 mt-1 tabular-nums">
            {newOrdersCount}
          </p>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Confirmed &amp; Dispatched</span>
            <Package className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-lg font-mono font-bold text-purple-400 mt-1 tabular-nums">
            {confirmedCount}
          </p>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Delivered / Collected</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">PAID</span>
          </div>
          <p className="text-lg font-mono font-bold text-emerald-400 mt-1 tabular-nums">
            {deliveredCount}
          </p>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Total Filtered Value</span>
            <DollarSign className="w-3.5 h-3.5 text-foreground" />
          </div>
          <p className="text-lg font-mono font-bold text-foreground mt-1 tabular-nums">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Filter Row & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 flex-wrap">
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
            placeholder="Search order #, name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-muted-foreground">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              No orders found
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No orders matching "${searchQuery}".`
                : "Record your first COD order intake."}
            </p>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-600/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record First Order</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-subtle text-muted-foreground text-[10px] uppercase border-b border-border">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer &amp; Phone</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Product &amp; Qty</th>
                  <th className="py-3 px-4 text-right">Total Cash</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  const style = statusBadges[order.status] || statusBadges.NEW_ORDER;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-surface-subtle/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap">
                        {order.order_number}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">
                          {order.customer_name}
                        </div>
                        <a
                          href={`tel:${order.phone}`}
                          className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{order.phone}</span>
                        </a>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{order.governorate}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                          {order.address}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">
                          {order.product?.name || "Product"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Qty: {order.quantity} &bull; {formatCurrency(order.unit_price)}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                        {formatCurrency(order.total_amount)}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
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

      {/* Order Dialog */}
      <OrderFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => fetchOrders(selectedProductId, selectedGov, selectedStatus)}
      />
    </div>
  );
}

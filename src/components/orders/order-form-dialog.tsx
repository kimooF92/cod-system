"use client";

import * as React from "react";
import {
  X,
  Plus,
  ShoppingBag,
  Phone,
  MapPin,
  DollarSign,
  Package,
  User,
} from "lucide-react";
import { createOrder } from "@/actions/orders";
import { getProducts, type Product } from "@/actions/products";
import { getCreativeAssets, type CreativeAsset } from "@/actions/creative-assets";
import {
  TUNISIAN_GOVERNORATES,
  type OrderInput,
  type TunisianGovernorate,
  isValidTunisianPhone,
  sanitizeTunisianPhone,
} from "@/lib/validations/order";
import { formatCurrency } from "@/lib/utils";

interface OrderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OrderFormDialog({
  isOpen,
  onClose,
  onSuccess,
}: OrderFormDialogProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [creatives, setCreatives] = React.useState<CreativeAsset[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<OrderInput>({
    customer_name: "",
    phone: "",
    governorate: "Tunis",
    address: "",
    product_id: "",
    quantity: 1,
    unit_price: 49.0,
    delivery_fee: 7.0,
    source: "Manual Intake",
    creative_id: "",
    notes: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      getProducts().then((prods) => {
        setProducts(prods);
        if (prods.length > 0 && !formData.product_id) {
          const first = prods[0];
          setFormData((prev) => ({
            ...prev,
            product_id: first.id,
            unit_price: first.selling_price || 49.0,
            delivery_fee: first.delivery_cost || 7.0,
          }));
        }
      });
      getCreativeAssets().then(setCreatives);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProductSelect = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setFormData((prev) => ({
      ...prev,
      product_id: productId,
      unit_price: prod ? prod.selling_price : prev.unit_price,
      delivery_fee: prod ? prod.delivery_cost : prev.delivery_fee,
    }));
  };

  const totalAmount = formData.quantity * formData.unit_price + formData.delivery_fee;
  const isPhoneValid = formData.phone ? isValidTunisianPhone(formData.phone) : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createOrder(formData);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to create order");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Manual COD Order Intake (FR-23, FR-24)
              </h3>
              <p className="text-xs text-muted-foreground">
                Fast order entry with Tunisian phone validation &amp; 24 governorates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Customer Full Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Mohamed Ben Salah"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>Tunisian Phone</span>
                </span>
                {!isPhoneValid && (
                  <span className="text-[10px] text-red-400">Must be 8 digits</span>
                )}
              </label>
              <input
                type="tel"
                placeholder="e.g. 20 123 456"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className={`w-full px-3 py-2 bg-surface-subtle border rounded-md text-xs font-mono text-foreground focus:outline-none ${
                  !isPhoneValid
                    ? "border-red-500/60 focus:border-red-500"
                    : "border-border focus:border-emerald-500"
                }`}
              />
            </div>
          </div>

          {/* Governorate & Detailed Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Governorate</span>
              </label>
              <select
                value={formData.governorate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    governorate: e.target.value as TunisianGovernorate,
                  })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {TUNISIAN_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Street Address / Delivery Notes
              </label>
              <input
                type="text"
                placeholder="e.g. 15 Rue Ibn Khaldoun, Khezama Ouest"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Product & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>Product</span>
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => handleProductSelect(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="" disabled>
                  -- Choose product --
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} &bull; {formatCurrency(p.selling_price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>
          </div>

          {/* Pricing Calculation Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Unit Price (DT)</label>
              <input
                type="number"
                step="1.0"
                value={formData.unit_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit_price: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Delivery Fee (DT)</label>
              <input
                type="number"
                step="0.5"
                value={formData.delivery_fee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery_fee: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1">
              <label className="text-[11px] text-muted-foreground">Total Cash to Collect</label>
              <div className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-xs font-mono font-bold text-emerald-400 tabular-nums">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>

          {/* Optional Order Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Internal / Courier Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Call customer after 4 PM, fragile packaging"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? "Recording..." : "Create COD Order"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

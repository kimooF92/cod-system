"use client";

import * as React from "react";
import { X, MessageSquare, ExternalLink, Copy, Check, Send } from "lucide-react";
import {
  getAllWhatsAppTemplates,
  type GeneratedWhatsAppMessage,
  type WhatsAppTemplateKey,
} from "@/lib/engine/whatsapp-templates";
import type { Order } from "@/actions/orders";

interface WhatsAppDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppDialog({ order, isOpen, onClose }: WhatsAppDialogProps) {
  const [selectedKey, setSelectedKey] = React.useState<WhatsAppTemplateKey>("DERJA_CONFIRM");
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !order) return null;

  const templates = getAllWhatsAppTemplates({
    customerName: order.customer_name,
    phone: order.phone,
    orderNumber: order.order_number,
    productName: order.product?.name || "Produit",
    quantity: order.quantity,
    totalAmount: order.total_amount,
    governorate: order.governorate,
    address: order.address,
    trackingCode: order.tracking_code || undefined,
  });

  const activeTemplate =
    templates.find((t) => t.templateKey === selectedKey) || templates[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTemplate.messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(activeTemplate.url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                1-Click WhatsApp Action
              </h3>
              <p className="text-xs text-muted-foreground">
                {order.customer_name} &bull; {order.phone} ({order.governorate})
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Template Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Select Message Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.templateKey}
                  type="button"
                  onClick={() => setSelectedKey(t.templateKey)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    selectedKey === t.templateKey
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-bold"
                      : "bg-surface-subtle text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="font-semibold truncate">{t.label}</div>
                  <div className="text-[10px] opacity-70 font-mono mt-0.5">
                    {t.language}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Message Preview
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 bg-surface-subtle border border-border rounded-lg text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed dir-auto max-h-56 overflow-y-auto">
              {activeTemplate.messageText}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in WhatsApp (+216 {order.phone})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

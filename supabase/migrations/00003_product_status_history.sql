-- Migration: 00003_product_status_history.sql
-- Description: Create product_status_history table for append-only audit trail (FR-11, AD-3)

CREATE TABLE IF NOT EXISTS public.product_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit query lookups by product and chronological ordering
CREATE INDEX IF NOT EXISTS idx_product_status_history_product_id ON public.product_status_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_status_history_created_at ON public.product_status_history(created_at DESC);

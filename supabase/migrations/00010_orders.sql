-- Migration: 00010_orders.sql
-- Description: Create orders table with full COD operational lifecycle columns & indexes (FR-23, FR-24)

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    governorate TEXT NOT NULL,
    address TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12, 3) NOT NULL,
    delivery_fee NUMERIC(12, 3) NOT NULL DEFAULT 7.000,
    total_amount NUMERIC(12, 3) NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW_ORDER' CHECK (status IN (
        'NEW_ORDER',
        'CONFIRMED',
        'DISPATCHED',
        'DELIVERED',
        'RETURNED',
        'CANCELLED',
        'NO_ANSWER'
    )),
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_contact_at TIMESTAMPTZ,
    next_follow_up_at TIMESTAMPTZ,
    courier_name TEXT,
    tracking_code TEXT,
    return_reason TEXT,
    return_fee NUMERIC(12, 3) NOT NULL DEFAULT 3.500,
    source TEXT DEFAULT 'Manual Intake',
    creative_id UUID REFERENCES public.creative_assets(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast high-density order triage and reconciliation
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_governorate ON public.orders(governorate);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Migration: 00002_products.sql
-- Description: Create products table with complete unit economics and status constraints

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    selling_price NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    product_cost NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    packaging_cost NUMERIC(12, 3) NOT NULL DEFAULT 1.500,
    delivery_cost NUMERIC(12, 3) NOT NULL DEFAULT 7.000,
    return_cost NUMERIC(12, 3) NOT NULL DEFAULT 3.500,
    other_fulfillment_cost NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    target_cpl NUMERIC(12, 3) NOT NULL DEFAULT 4.000,
    expected_delivery_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.6500, -- e.g. 0.6500 for 65%
    lead_capacity INTEGER NOT NULL DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'READY' CHECK (status IN (
        'IDEA', 'RESEARCH', 'READY', 'TESTING', 'HOLD', 'KILL', 'WINNER', 'SCALING', 'FATIGUED', 'ARCHIVED'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON public.products(updated_at DESC);

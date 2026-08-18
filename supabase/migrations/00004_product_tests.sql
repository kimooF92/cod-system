-- Migration: 00004_product_tests.sql
-- Description: Create product_tests table for bounded ad testing campaigns (FR-9, FR-10)

CREATE TABLE IF NOT EXISTS public.product_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    budget NUMERIC(12, 3) NOT NULL DEFAULT 100.000,
    target_leads INTEGER NOT NULL DEFAULT 25,
    target_cpl NUMERIC(12, 3) NOT NULL DEFAULT 4.000,
    expected_delivery_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.6500,
    target_profit_per_order NUMERIC(12, 3) NOT NULL DEFAULT 15.000,
    planned_creative_quantity INTEGER NOT NULL DEFAULT 3,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for status and product queries
CREATE INDEX IF NOT EXISTS idx_product_tests_product_id ON public.product_tests(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tests_status ON public.product_tests(status);
CREATE INDEX IF NOT EXISTS idx_product_tests_created_at ON public.product_tests(created_at DESC);

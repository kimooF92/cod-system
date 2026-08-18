-- Migration: 00005_product_scores.sql
-- Description: Create product_scores table to persist 0-100 composite scores and sub-dimension breakdowns (FR-12)

CREATE TABLE IF NOT EXISTS public.product_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    composite_score INTEGER NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
    cpl_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    profit_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    delivery_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    confirmation_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    creative_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    breakdown_json JSONB,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for product lookup
CREATE INDEX IF NOT EXISTS idx_product_scores_product_id ON public.product_scores(product_id);
CREATE INDEX IF NOT EXISTS idx_product_scores_composite ON public.product_scores(composite_score DESC);

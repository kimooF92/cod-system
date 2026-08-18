-- Migration: 00001_research_items.sql
-- Description: Create research_items table for product opportunity backlog

CREATE TABLE IF NOT EXISTS public.research_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market TEXT NOT NULL DEFAULT 'Tunisia',
    problem TEXT NOT NULL,
    target_customer TEXT NOT NULL,
    pain_point TEXT NOT NULL,
    promise TEXT NOT NULL,
    competitors TEXT,
    estimated_cost NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    estimated_price NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    creative_opportunities TEXT,
    source TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'IDEA' CHECK (status IN ('IDEA', 'VALIDATING', 'READY_FOR_TEST', 'DISCARDED', 'CONVERTED')),
    converted_product_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for status filtering and listing by date
CREATE INDEX IF NOT EXISTS idx_research_items_status ON public.research_items(status);
CREATE INDEX IF NOT EXISTS idx_research_items_created_at ON public.research_items(created_at DESC);

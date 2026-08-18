-- Migration: 00006_marketing_angles_hooks.sql
-- Description: Create marketing_angles and marketing_hooks tables (FR-13, FR-14, FR-15)

CREATE TABLE IF NOT EXISTS public.marketing_angles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pain_point TEXT NOT NULL,
    promise TEXT NOT NULL,
    target_customer_avatar TEXT NOT NULL DEFAULT 'General Consumer',
    creative_format TEXT NOT NULL DEFAULT 'PROBLEM_SOLUTION',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketing_hooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    angle_id UUID NOT NULL REFERENCES public.marketing_angles(id) ON DELETE CASCADE,
    hook_text TEXT NOT NULL,
    hook_type TEXT NOT NULL DEFAULT 'PROBLEM_AGITATION',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_angles_product_id ON public.marketing_angles(product_id);
CREATE INDEX IF NOT EXISTS idx_marketing_hooks_angle_id ON public.marketing_hooks(angle_id);

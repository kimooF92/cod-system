-- Migration: 00007_creative_assets.sql
-- Description: Create creative_assets table for tracking individual ad creatives (FR-16, FR-17)

CREATE TABLE IF NOT EXISTS public.creative_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    angle_id UUID REFERENCES public.marketing_angles(id) ON DELETE SET NULL,
    hook_id UUID REFERENCES public.marketing_hooks(id) ON DELETE SET NULL,
    asset_type TEXT NOT NULL DEFAULT 'VIDEO' CHECK (asset_type IN ('VIDEO', 'IMAGE', 'CAROUSEL')),
    aspect_ratio TEXT NOT NULL DEFAULT '9:16' CHECK (aspect_ratio IN ('9:16', '1:1', '4:5', '16:9')),
    creator_source TEXT NOT NULL DEFAULT 'In-House',
    media_url TEXT,
    thumbnail_url TEXT,
    primary_hook_text TEXT,
    lifecycle_status TEXT NOT NULL DEFAULT 'TESTING' CHECK (lifecycle_status IN ('TESTING', 'ACTIVE', 'FATIGUED', 'PAUSED', 'ARCHIVED')),
    performance_tag TEXT NOT NULL DEFAULT 'KEEP' CHECK (performance_tag IN ('WINNER', 'KEEP', 'ITERATE', 'KILL')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for querying creatives by product, status, and tag
CREATE INDEX IF NOT EXISTS idx_creative_assets_product_id ON public.creative_assets(product_id);
CREATE INDEX IF NOT EXISTS idx_creative_assets_status ON public.creative_assets(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_creative_assets_tag ON public.creative_assets(performance_tag);

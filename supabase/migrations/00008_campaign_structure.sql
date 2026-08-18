-- Migration: 00008_campaign_structure.sql
-- Description: Create ad_campaigns, ad_sets, and ads tables for hierarchical campaign mapping (FR-18)

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'META_ADS' CHECK (platform IN ('META_ADS', 'TIKTOK_ADS', 'SNAPCHAT_ADS', 'GOOGLE_ADS')),
    objective TEXT NOT NULL DEFAULT 'TESTING' CHECK (objective IN ('TESTING', 'SCALING', 'RETARGETING', 'WARMUP')),
    daily_budget NUMERIC(12, 3) NOT NULL DEFAULT 50.000,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ad_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    audience_targeting TEXT NOT NULL DEFAULT 'Broad Tunisia 22-55',
    daily_budget NUMERIC(12, 3),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_set_id UUID NOT NULL REFERENCES public.ad_sets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    creative_id UUID NOT NULL REFERENCES public.creative_assets(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for hierarchical lookups
CREATE INDEX IF NOT EXISTS idx_ad_sets_campaign_id ON public.ad_sets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ads_ad_set_id ON public.ads(ad_set_id);
CREATE INDEX IF NOT EXISTS idx_ads_product_id ON public.ads(product_id);
CREATE INDEX IF NOT EXISTS idx_ads_creative_id ON public.ads(creative_id);

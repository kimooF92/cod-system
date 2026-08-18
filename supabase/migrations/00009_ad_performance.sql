-- Migration: 00009_ad_performance.sql
-- Description: Create ad_performance_daily table for tracking daily ad spend and performance metrics (FR-19, FR-20, FR-21)

CREATE TABLE IF NOT EXISTS public.ad_performance_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES public.ads(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE SET NULL,
    creative_id UUID REFERENCES public.creative_assets(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    spend NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    leads INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for time-series and entity queries
CREATE INDEX IF NOT EXISTS idx_ad_perf_date ON public.ad_performance_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_perf_ad_id ON public.ad_performance_daily(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_perf_campaign_id ON public.ad_performance_daily(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_perf_product_id ON public.ad_performance_daily(product_id);
CREATE INDEX IF NOT EXISTS idx_ad_perf_creative_id ON public.ad_performance_daily(creative_id);

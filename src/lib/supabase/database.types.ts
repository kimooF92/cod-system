export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductStatus =
  | "IDEA"
  | "RESEARCH"
  | "READY"
  | "TESTING"
  | "HOLD"
  | "KILL"
  | "WINNER"
  | "SCALING"
  | "FATIGUED"
  | "ARCHIVED";

export type OrderStatus =
  | "NEW_ORDER"
  | "NEW"
  | "CONTACTING"
  | "CONFIRMED"
  | "PREPARING"
  | "DISPATCHED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "NO_ANSWER"
  | "RETURNED";

export type DecisionType = "KILL" | "HOLD" | "SCALE" | "BIG_SCALE";
export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";
export type CreativeRecommendation = "WINNER" | "KEEP" | "ITERATE" | "KILL";

export interface Database {
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string;
          min_sample_medium: number;
          min_sample_high: number;
          target_delivery_rate: number;
          target_confirmation_rate: number;
          default_packaging_cost: number;
          default_delivery_cost: number;
          default_return_cost: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["app_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["app_settings"]["Row"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          sku: string | null;
          selling_price: number;
          product_cost: number;
          packaging_cost: number;
          delivery_cost: number;
          return_cost: number;
          other_fulfillment_cost: number;
          target_cpl: number;
          expected_delivery_rate: number;
          lead_capacity: number;
          status: ProductStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      research_items: {
        Row: {
          id: string;
          market: string;
          problem: string;
          target_customer: string;
          pain_point: string;
          promise: string;
          competitors: string | null;
          estimated_cost: number;
          estimated_price: number;
          creative_opportunities: string | null;
          source: string | null;
          notes: string | null;
          status: "IDEA" | "VALIDATING" | "READY_FOR_TEST" | "DISCARDED" | "CONVERTED";
          converted_product_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["research_items"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["research_items"]["Row"]>;
      };
      product_status_history: {
        Row: {
          id: string;
          product_id: string;
          previous_status: ProductStatus | null;
          new_status: ProductStatus;
          reason: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["product_status_history"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_status_history"]["Row"]>;
      };
      product_tests: {
        Row: {
          id: string;
          product_id: string;
          start_date: string;
          end_date: string | null;
          budget: number;
          target_leads: number;
          target_cpl: number;
          expected_delivery_rate: number;
          target_profit_per_order: number;
          planned_creative_quantity: number;
          notes: string | null;
          status: "RUNNING" | "COMPLETED" | "CANCELLED";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["product_tests"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_tests"]["Row"]>;
      };
      product_scores: {
        Row: {
          id: string;
          product_id: string;
          composite_score: number;
          cpl_score: number;
          profit_score: number;
          delivery_score: number;
          confirmation_score: number;
          creative_score: number;
          breakdown_json: Json | null;
          calculated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["product_scores"]["Row"], "id" | "calculated_at"> & {
          id?: string;
          calculated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_scores"]["Row"]>;
      };
      marketing_angles: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          pain_point: string;
          promise: string;
          target_customer_avatar: string;
          creative_format: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["marketing_angles"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["marketing_angles"]["Row"]>;
      };
      marketing_hooks: {
        Row: {
          id: string;
          angle_id: string;
          hook_text: string;
          hook_type: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["marketing_hooks"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["marketing_hooks"]["Row"]>;
      };
      creative_assets: {
        Row: {
          id: string;
          code: string;
          product_id: string;
          angle_id: string | null;
          hook_id: string | null;
          asset_type: "VIDEO" | "IMAGE" | "CAROUSEL";
          aspect_ratio: "9:16" | "1:1" | "4:5" | "16:9";
          creator_source: string;
          media_url: string | null;
          thumbnail_url: string | null;
          primary_hook_text: string | null;
          lifecycle_status: "TESTING" | "ACTIVE" | "FATIGUED" | "PAUSED" | "ARCHIVED";
          performance_tag: "WINNER" | "KEEP" | "ITERATE" | "KILL";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["creative_assets"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["creative_assets"]["Row"]>;
      };
      ad_campaigns: {
        Row: {
          id: string;
          name: string;
          platform: "META_ADS" | "TIKTOK_ADS" | "SNAPCHAT_ADS" | "GOOGLE_ADS";
          objective: "TESTING" | "SCALING" | "RETARGETING" | "WARMUP";
          daily_budget: number;
          status: "ACTIVE" | "PAUSED" | "ARCHIVED";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ad_campaigns"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ad_campaigns"]["Row"]>;
      };
      ad_sets: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          audience_targeting: string;
          daily_budget: number | null;
          status: "ACTIVE" | "PAUSED" | "ARCHIVED";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ad_sets"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ad_sets"]["Row"]>;
      };
      ads: {
        Row: {
          id: string;
          ad_set_id: string;
          name: string;
          product_id: string;
          creative_id: string;
          status: "ACTIVE" | "PAUSED" | "ARCHIVED";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ads"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ads"]["Row"]>;
      };
      ad_performance_daily: {
        Row: {
          id: string;
          ad_id: string | null;
          campaign_id: string | null;
          creative_id: string | null;
          product_id: string;
          date: string;
          spend: number;
          impressions: number;
          clicks: number;
          leads: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ad_performance_daily"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ad_performance_daily"]["Row"]>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          phone: string;
          governorate: string;
          address: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          delivery_fee: number;
          total_amount: number;
          status: OrderStatus;
          attempt_count: number;
          last_contact_at: string | null;
          next_follow_up_at: string | null;
          courier_name: string | null;
          tracking_code: string | null;
          return_reason: string | null;
          return_fee: number;
          source: string | null;
          creative_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      financial_transactions: {
        Row: {
          id: string;
          transaction_date: string;
          amount: number;
          category:
            | "AD_SPEND"
            | "PRODUCT_PURCHASE"
            | "DELIVERY_FEE"
            | "RETURN_FEE"
            | "PACKAGING"
            | "SUPPLIER_PAYMENT"
            | "CUSTOMER_PAYMENT"
            | "OTHER_EXPENSE"
            | "OWNER_WITHDRAWAL"
            | "OWNER_INJECTION";
          cash_bucket: "ADVERTISING" | "OPERATIONS" | "PROFIT_VAULT";
          product_id: string | null;
          order_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["financial_transactions"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["financial_transactions"]["Row"]>;
      };
      decision_logs: {
        Row: {
          id: string;
          product_id: string;
          recommendation: DecisionType;
          confidence: ConfidenceLevel;
          action_taken: "ACCEPTED" | "OVERRIDDEN";
          resulting_status: ProductStatus;
          reason: string | null;
          metrics_snapshot: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["decision_logs"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["decision_logs"]["Row"]>;
      };
    };
  };
}

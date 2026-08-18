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
  | "NEW"
  | "CONTACTING"
  | "CONFIRMED"
  | "PREPARING"
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

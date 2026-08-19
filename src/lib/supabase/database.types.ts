export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ad_campaigns: {
        Row: {
          created_at: string
          daily_budget: number
          id: string
          name: string
          objective: string
          platform: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_budget?: number
          id?: string
          name: string
          objective?: string
          platform?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_budget?: number
          id?: string
          name?: string
          objective?: string
          platform?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ad_performance_daily: {
        Row: {
          ad_id: string | null
          campaign_id: string | null
          clicks: number
          created_at: string
          creative_id: string | null
          date: string
          id: string
          impressions: number
          leads: number
          notes: string | null
          product_id: string | null
          spend: number
        }
        Insert: {
          ad_id?: string | null
          campaign_id?: string | null
          clicks?: number
          created_at?: string
          creative_id?: string | null
          date?: string
          id?: string
          impressions?: number
          leads?: number
          notes?: string | null
          product_id?: string | null
          spend?: number
        }
        Update: {
          ad_id?: string | null
          campaign_id?: string | null
          clicks?: number
          created_at?: string
          creative_id?: string | null
          date?: string
          id?: string
          impressions?: number
          leads?: number
          notes?: string | null
          product_id?: string | null
          spend?: number
        }
        Relationships: [
          {
            foreignKeyName: "ad_performance_daily_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_performance_daily_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_performance_daily_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creative_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_performance_daily_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_sets: {
        Row: {
          audience_targeting: string
          campaign_id: string
          created_at: string
          daily_budget: number | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          audience_targeting?: string
          campaign_id: string
          created_at?: string
          daily_budget?: number | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          audience_targeting?: string
          campaign_id?: string
          created_at?: string
          daily_budget?: number | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_sets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_set_id: string
          created_at: string
          creative_id: string
          id: string
          name: string
          product_id: string
          status: string
          updated_at: string
        }
        Insert: {
          ad_set_id: string
          created_at?: string
          creative_id: string
          id?: string
          name: string
          product_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          ad_set_id?: string
          created_at?: string
          creative_id?: string
          id?: string
          name?: string
          product_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creative_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_assets: {
        Row: {
          angle_id: string | null
          aspect_ratio: string
          asset_type: string
          code: string
          created_at: string
          creator_source: string
          hook_id: string | null
          id: string
          lifecycle_status: string
          media_url: string | null
          notes: string | null
          performance_tag: string
          primary_hook_text: string | null
          product_id: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          angle_id?: string | null
          aspect_ratio?: string
          asset_type?: string
          code: string
          created_at?: string
          creator_source?: string
          hook_id?: string | null
          id?: string
          lifecycle_status?: string
          media_url?: string | null
          notes?: string | null
          performance_tag?: string
          primary_hook_text?: string | null
          product_id: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          angle_id?: string | null
          aspect_ratio?: string
          asset_type?: string
          code?: string
          created_at?: string
          creator_source?: string
          hook_id?: string | null
          id?: string
          lifecycle_status?: string
          media_url?: string | null
          notes?: string | null
          performance_tag?: string
          primary_hook_text?: string | null
          product_id?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_assets_angle_id_fkey"
            columns: ["angle_id"]
            isOneToOne: false
            referencedRelation: "marketing_angles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_assets_hook_id_fkey"
            columns: ["hook_id"]
            isOneToOne: false
            referencedRelation: "marketing_hooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_assets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_angles: {
        Row: {
          created_at: string
          creative_format: string
          id: string
          name: string
          notes: string | null
          pain_point: string
          product_id: string
          promise: string
          target_customer_avatar: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creative_format?: string
          id?: string
          name: string
          notes?: string | null
          pain_point: string
          product_id: string
          promise: string
          target_customer_avatar?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creative_format?: string
          id?: string
          name?: string
          notes?: string | null
          pain_point?: string
          product_id?: string
          promise?: string
          target_customer_avatar?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_angles_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_hooks: {
        Row: {
          angle_id: string
          created_at: string
          hook_text: string
          hook_type: string
          id: string
          notes: string | null
        }
        Insert: {
          angle_id: string
          created_at?: string
          hook_text: string
          hook_type?: string
          id?: string
          notes?: string | null
        }
        Update: {
          angle_id?: string
          created_at?: string
          hook_text?: string
          hook_type?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_hooks_angle_id_fkey"
            columns: ["angle_id"]
            isOneToOne: false
            referencedRelation: "marketing_angles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          attempt_count: number
          courier_name: string | null
          created_at: string
          creative_id: string | null
          customer_name: string
          delivery_fee: number
          governorate: string
          id: string
          last_contact_at: string | null
          next_follow_up_at: string | null
          notes: string | null
          order_number: string
          phone: string
          product_id: string
          quantity: number
          return_fee: number
          return_reason: string | null
          source: string | null
          status: string
          total_amount: number
          tracking_code: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          address: string
          attempt_count?: number
          courier_name?: string | null
          created_at?: string
          creative_id?: string | null
          customer_name: string
          delivery_fee?: number
          governorate: string
          id?: string
          last_contact_at?: string | null
          next_follow_up_at?: string | null
          notes?: string | null
          order_number: string
          phone: string
          product_id: string
          quantity?: number
          return_fee?: number
          return_reason?: string | null
          source?: string | null
          status?: string
          total_amount: number
          tracking_code?: string | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          address?: string
          attempt_count?: number
          courier_name?: string | null
          created_at?: string
          creative_id?: string | null
          customer_name?: string
          delivery_fee?: number
          governorate?: string
          id?: string
          last_contact_at?: string | null
          next_follow_up_at?: string | null
          notes?: string | null
          order_number?: string
          phone?: string
          product_id?: string
          quantity?: number
          return_fee?: number
          return_reason?: string | null
          source?: string | null
          status?: string
          total_amount?: number
          tracking_code?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creative_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_scores: {
        Row: {
          breakdown_json: Json | null
          calculated_at: string
          composite_score: number
          confirmation_score: number
          cpl_score: number
          creative_score: number
          delivery_score: number
          id: string
          product_id: string
          profit_score: number
        }
        Insert: {
          breakdown_json?: Json | null
          calculated_at?: string
          composite_score: number
          confirmation_score?: number
          cpl_score?: number
          creative_score?: number
          delivery_score?: number
          id?: string
          product_id: string
          profit_score?: number
        }
        Update: {
          breakdown_json?: Json | null
          calculated_at?: string
          composite_score?: number
          confirmation_score?: number
          cpl_score?: number
          creative_score?: number
          delivery_score?: number
          id?: string
          product_id?: string
          profit_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_scores_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_status_history: {
        Row: {
          created_at: string
          id: string
          new_status: string
          previous_status: string | null
          product_id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_status: string
          previous_status?: string | null
          product_id: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_status?: string
          previous_status?: string | null
          product_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_status_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tests: {
        Row: {
          budget: number
          created_at: string
          end_date: string | null
          expected_delivery_rate: number
          id: string
          notes: string | null
          planned_creative_quantity: number
          product_id: string
          start_date: string
          status: string
          target_cpl: number
          target_leads: number
          target_profit_per_order: number
        }
        Insert: {
          budget?: number
          created_at?: string
          end_date?: string | null
          expected_delivery_rate?: number
          id?: string
          notes?: string | null
          planned_creative_quantity?: number
          product_id: string
          start_date?: string
          status?: string
          target_cpl?: number
          target_leads?: number
          target_profit_per_order?: number
        }
        Update: {
          budget?: number
          created_at?: string
          end_date?: string | null
          expected_delivery_rate?: number
          id?: string
          notes?: string | null
          planned_creative_quantity?: number
          product_id?: string
          start_date?: string
          status?: string
          target_cpl?: number
          target_leads?: number
          target_profit_per_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          delivery_cost: number
          expected_delivery_rate: number
          id: string
          lead_capacity: number
          name: string
          notes: string | null
          other_fulfillment_cost: number
          packaging_cost: number
          product_cost: number
          return_cost: number
          selling_price: number
          sku: string | null
          status: string
          target_cpl: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_cost?: number
          expected_delivery_rate?: number
          id?: string
          lead_capacity?: number
          name: string
          notes?: string | null
          other_fulfillment_cost?: number
          packaging_cost?: number
          product_cost?: number
          return_cost?: number
          selling_price?: number
          sku?: string | null
          status?: string
          target_cpl?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_cost?: number
          expected_delivery_rate?: number
          id?: string
          lead_capacity?: number
          name?: string
          notes?: string | null
          other_fulfillment_cost?: number
          packaging_cost?: number
          product_cost?: number
          return_cost?: number
          selling_price?: number
          sku?: string | null
          status?: string
          target_cpl?: number
          updated_at?: string
        }
        Relationships: []
      }
      research_items: {
        Row: {
          competitors: string | null
          converted_product_id: string | null
          created_at: string
          creative_opportunities: string | null
          estimated_cost: number
          estimated_price: number
          id: string
          market: string
          notes: string | null
          pain_point: string
          problem: string
          promise: string
          source: string | null
          status: string
          target_customer: string
        }
        Insert: {
          competitors?: string | null
          converted_product_id?: string | null
          created_at?: string
          creative_opportunities?: string | null
          estimated_cost?: number
          estimated_price?: number
          id?: string
          market?: string
          notes?: string | null
          pain_point: string
          problem: string
          promise: string
          source?: string | null
          status?: string
          target_customer: string
        }
        Update: {
          competitors?: string | null
          converted_product_id?: string | null
          created_at?: string
          creative_opportunities?: string | null
          estimated_cost?: number
          estimated_price?: number
          id?: string
          market?: string
          notes?: string | null
          pain_point?: string
          problem?: string
          promise?: string
          source?: string | null
          status?: string
          target_customer?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

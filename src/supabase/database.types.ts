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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      coupons: {
        Row: {
          code: string
          created_at: string
          discount: number
          id: number
          is_active: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          discount: number
          id?: number
          is_active?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          discount?: number
          id?: number
          is_active?: boolean | null
        }
        Relationships: []
      }
      item_booth: {
        Row: {
          car_model: string | null
          created_at: string
          id: number
          order_id: number | null
          plates: string | null
        }
        Insert: {
          car_model?: string | null
          created_at?: string
          id?: number
          order_id?: number | null
          plates?: string | null
        }
        Update: {
          car_model?: string | null
          created_at?: string
          id?: number
          order_id?: number | null
          plates?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_booth_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      item_gubernamental: {
        Row: {
          building: string | null
          created_at: string
          floor: string | null
          id: number
          order_id: number | null
        }
        Insert: {
          building?: string | null
          created_at?: string
          floor?: string | null
          id?: number
          order_id?: number | null
        }
        Update: {
          building?: string | null
          created_at?: string
          floor?: string | null
          id?: number
          order_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "item_gubernamental_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      item_order: {
        Row: {
          created_at: string
          id: number
          order_id: number | null
          product_id: number | null
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: number
          order_id?: number | null
          product_id?: number | null
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: number
          order_id?: number | null
          product_id?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "item_order_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_order_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          confirmation_code: string | null
          coupon_applied: number | null
          created_at: string
          id: number
          order_type: Database["public"]["Enums"]["ORDER_TYPE"] | null
          price: number | null
          status: Database["public"]["Enums"]["STATUS_ORDER"]
          user_phone: string
        }
        Insert: {
          confirmation_code?: string | null
          coupon_applied?: number | null
          created_at?: string
          id?: number
          order_type?: Database["public"]["Enums"]["ORDER_TYPE"] | null
          price?: number | null
          status?: Database["public"]["Enums"]["STATUS_ORDER"]
          user_phone: string
        }
        Update: {
          confirmation_code?: string | null
          coupon_applied?: number | null
          created_at?: string
          id?: number
          order_type?: Database["public"]["Enums"]["ORDER_TYPE"] | null
          price?: number | null
          status?: Database["public"]["Enums"]["STATUS_ORDER"]
          user_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_applied_fkey"
            columns: ["coupon_applied"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_price_fkey"
            columns: ["price"]
            isOneToOne: false
            referencedRelation: "send_price"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business: Database["public"]["Enums"]["BUSINESS_TYPE"]
          created_at: string
          id: number
          image_url: string
          name: string
          price: number
        }
        Insert: {
          business?: Database["public"]["Enums"]["BUSINESS_TYPE"]
          created_at?: string
          id?: number
          image_url: string
          name: string
          price: number
        }
        Update: {
          business?: Database["public"]["Enums"]["BUSINESS_TYPE"]
          created_at?: string
          id?: number
          image_url?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      send_price: {
        Row: {
          created_at: string
          id: number
          price: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          price?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          price?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          id: number
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          phone?: string
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
      BUSINESS_TYPE: "JAGUARES" | "PUESTO"
      ORDER_TYPE: "GUBERNAMENTAL" | "CASETA"
      STATUS_ORDER:
        | "INIT"
        | "IN_PROGRESS"
        | "READY"
        | "DELIVERED"
        | "PAYED"
        | "BOT_READY"
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
    Enums: {
      BUSINESS_TYPE: ["JAGUARES", "PUESTO"],
      ORDER_TYPE: ["GUBERNAMENTAL", "CASETA"],
      STATUS_ORDER: [
        "INIT",
        "IN_PROGRESS",
        "READY",
        "DELIVERED",
        "PAYED",
        "BOT_READY",
      ],
    },
  },
} as const

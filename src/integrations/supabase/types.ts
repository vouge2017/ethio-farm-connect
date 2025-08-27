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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          acquisition_date: string | null
          animal_id: string
          birth_date: string | null
          breed: string | null
          created_at: string
          father_id: string | null
          gender: Database["public"]["Enums"]["animal_gender"] | null
          id: string
          is_active: boolean | null
          mother_id: string | null
          name: string | null
          notes: string | null
          owner_id: string
          photos: string[] | null
          type: Database["public"]["Enums"]["animal_type"]
          updated_at: string
        }
        Insert: {
          acquisition_date?: string | null
          animal_id: string
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          father_id?: string | null
          gender?: Database["public"]["Enums"]["animal_gender"] | null
          id?: string
          is_active?: boolean | null
          mother_id?: string | null
          name?: string | null
          notes?: string | null
          owner_id: string
          photos?: string[] | null
          type: Database["public"]["Enums"]["animal_type"]
          updated_at?: string
        }
        Update: {
          acquisition_date?: string | null
          animal_id?: string
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          father_id?: string | null
          gender?: Database["public"]["Enums"]["animal_gender"] | null
          id?: string
          is_active?: boolean | null
          mother_id?: string | null
          name?: string | null
          notes?: string | null
          owner_id?: string
          photos?: string[] | null
          type?: Database["public"]["Enums"]["animal_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animals_father_id_fkey"
            columns: ["father_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animals_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      answers: {
        Row: {
          author_id: string
          content: string
          created_at: string
          helpful_count: number | null
          id: string
          is_vet_answer: boolean | null
          question_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_vet_answer?: boolean | null
          question_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_vet_answer?: boolean | null
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string | null
          listing_id: string
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id: string
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_tips: {
        Row: {
          animal_types: Database["public"]["Enums"]["animal_type"][] | null
          category: string
          content_am: string
          content_en: string | null
          content_om: string | null
          created_at: string
          created_by: string
          id: string
          image_url: string | null
          is_published: boolean | null
          publish_date: string | null
          title_am: string
          title_en: string | null
          title_om: string | null
        }
        Insert: {
          animal_types?: Database["public"]["Enums"]["animal_type"][] | null
          category: string
          content_am: string
          content_en?: string | null
          content_om?: string | null
          created_at?: string
          created_by: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          publish_date?: string | null
          title_am: string
          title_en?: string | null
          title_om?: string | null
        }
        Update: {
          animal_types?: Database["public"]["Enums"]["animal_type"][] | null
          category?: string
          content_am?: string
          content_en?: string | null
          content_om?: string | null
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          publish_date?: string | null
          title_am?: string
          title_en?: string | null
          title_om?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_tips_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      health_records: {
        Row: {
          animal_id: string
          created_at: string
          created_by: string
          description: string
          id: string
          medications: string | null
          next_checkup_date: string | null
          photos: string[] | null
          record_date: string
          record_type: string
          vet_name: string | null
        }
        Insert: {
          animal_id: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          medications?: string | null
          next_checkup_date?: string | null
          photos?: string[] | null
          record_date?: string
          record_type: string
          vet_name?: string | null
        }
        Update: {
          animal_id?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          medications?: string | null
          next_checkup_date?: string | null
          photos?: string[] | null
          record_date?: string
          record_type?: string
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      listings: {
        Row: {
          animal_id: string | null
          contact_phone: string | null
          contact_telegram: string | null
          created_at: string
          description: string
          expires_at: string
          id: string
          listing_id: string
          location_region: string
          location_woreda: string | null
          location_zone: string | null
          photos: string[]
          price: number
          seller_id: string
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string
          updated_at: string
          verification_notes: string | null
          verification_tier:
            | Database["public"]["Enums"]["verification_tier"]
            | null
          verified_at: string | null
          verified_by: string | null
          videos: string[] | null
          view_count: number | null
        }
        Insert: {
          animal_id?: string | null
          contact_phone?: string | null
          contact_telegram?: string | null
          created_at?: string
          description: string
          expires_at?: string
          id?: string
          listing_id: string
          location_region: string
          location_woreda?: string | null
          location_zone?: string | null
          photos: string[]
          price: number
          seller_id: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          title: string
          updated_at?: string
          verification_notes?: string | null
          verification_tier?:
            | Database["public"]["Enums"]["verification_tier"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          videos?: string[] | null
          view_count?: number | null
        }
        Update: {
          animal_id?: string | null
          contact_phone?: string | null
          contact_telegram?: string | null
          created_at?: string
          description?: string
          expires_at?: string
          id?: string
          listing_id?: string
          location_region?: string
          location_woreda?: string | null
          location_zone?: string | null
          photos?: string[]
          price?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string
          updated_at?: string
          verification_notes?: string | null
          verification_tier?:
            | Database["public"]["Enums"]["verification_tier"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          videos?: string[] | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "listings_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          is_quick_reply: boolean | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_quick_reply?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_quick_reply?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      milk_records: {
        Row: {
          animal_id: string
          created_at: string
          created_by: string
          evening_amount: number | null
          id: string
          morning_amount: number | null
          notes: string | null
          production_date: string
          total_amount: number | null
        }
        Insert: {
          animal_id: string
          created_at?: string
          created_by: string
          evening_amount?: number | null
          id?: string
          morning_amount?: number | null
          notes?: string | null
          production_date?: string
          total_amount?: number | null
        }
        Update: {
          animal_id?: string
          created_at?: string
          created_by?: string
          evening_amount?: number | null
          id?: string
          morning_amount?: number | null
          notes?: string | null
          production_date?: string
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "milk_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milk_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      otp_logs: {
        Row: {
          attempts: number | null
          channel: Database["public"]["Enums"]["otp_channel"]
          created_at: string
          expires_at: string
          id: string
          is_used: boolean | null
          otp_code: string
          phone_number: string
        }
        Insert: {
          attempts?: number | null
          channel: Database["public"]["Enums"]["otp_channel"]
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean | null
          otp_code: string
          phone_number: string
        }
        Update: {
          attempts?: number | null
          channel?: Database["public"]["Enums"]["otp_channel"]
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean | null
          otp_code?: string
          phone_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          location_region: string | null
          location_woreda: string | null
          location_zone: string | null
          phone_number: string
          preferred_otp_channel:
            | Database["public"]["Enums"]["otp_channel"]
            | null
          role: Database["public"]["Enums"]["user_role"]
          telegram_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          location_region?: string | null
          location_woreda?: string | null
          location_zone?: string | null
          phone_number: string
          preferred_otp_channel?:
            | Database["public"]["Enums"]["otp_channel"]
            | null
          role?: Database["public"]["Enums"]["user_role"]
          telegram_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          location_region?: string | null
          location_woreda?: string | null
          location_zone?: string | null
          phone_number?: string
          preferred_otp_channel?:
            | Database["public"]["Enums"]["otp_channel"]
            | null
          role?: Database["public"]["Enums"]["user_role"]
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          animal_type: Database["public"]["Enums"]["animal_type"] | null
          audio_url: string | null
          author_id: string
          content: string
          created_at: string
          id: string
          photos: string[] | null
          status: Database["public"]["Enums"]["question_status"] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          animal_type?: Database["public"]["Enums"]["animal_type"] | null
          audio_url?: string | null
          author_id: string
          content: string
          created_at?: string
          id?: string
          photos?: string[] | null
          status?: Database["public"]["Enums"]["question_status"] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          animal_type?: Database["public"]["Enums"]["animal_type"] | null
          audio_url?: string | null
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          photos?: string[] | null
          status?: Database["public"]["Enums"]["question_status"] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vet_profiles: {
        Row: {
          available_hours: string | null
          bio: string | null
          consultation_fee: number | null
          created_at: string
          education: string | null
          id: string
          is_verified: boolean | null
          license_document_url: string | null
          license_number: string
          service_areas: string[] | null
          specializations: string[] | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          available_hours?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          education?: string | null
          id?: string
          is_verified?: boolean | null
          license_document_url?: string | null
          license_number: string
          service_areas?: string[] | null
          specializations?: string[] | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          available_hours?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          education?: string | null
          id?: string
          is_verified?: boolean | null
          license_document_url?: string | null
          license_number?: string
          service_areas?: string[] | null
          specializations?: string[] | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vet_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_animal_id: {
        Args: {
          animal_type_param: Database["public"]["Enums"]["animal_type"]
          owner_name: string
        }
        Returns: string
      }
      generate_listing_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      animal_gender: "male" | "female" | "unknown"
      animal_type:
        | "cattle"
        | "goat"
        | "sheep"
        | "chicken"
        | "camel"
        | "donkey"
        | "horse"
        | "other"
      listing_status:
        | "active"
        | "pending_sale"
        | "sold"
        | "unavailable"
        | "expired"
      message_type: "text" | "image" | "quick_reply"
      otp_channel: "sms" | "telegram"
      question_status: "open" | "answered" | "closed"
      user_role: "farmer" | "vet" | "admin"
      verification_tier: "free" | "video_verified" | "vet_inspected"
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
      animal_gender: ["male", "female", "unknown"],
      animal_type: [
        "cattle",
        "goat",
        "sheep",
        "chicken",
        "camel",
        "donkey",
        "horse",
        "other",
      ],
      listing_status: [
        "active",
        "pending_sale",
        "sold",
        "unavailable",
        "expired",
      ],
      message_type: ["text", "image", "quick_reply"],
      otp_channel: ["sms", "telegram"],
      question_status: ["open", "answered", "closed"],
      user_role: ["farmer", "vet", "admin"],
      verification_tier: ["free", "video_verified", "vet_inspected"],
    },
  },
} as const

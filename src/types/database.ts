// src/types/database.ts
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          subscription_status: string | null;
          subscription_tier: string | null;
          stripe_customer_id: string | null;
          credits_remaining: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          subscription_status?: string | null;
          subscription_tier?: string | null;
          stripe_customer_id?: string | null;
          credits_remaining?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          subscription_status?: string | null;
          subscription_tier?: string | null;
          stripe_customer_id?: string | null;
          credits_remaining?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

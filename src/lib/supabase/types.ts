import { createClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          currency: string | null
          default_hourly_rate: number | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          currency?: string | null
          default_hourly_rate?: number | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          currency?: string | null
          default_hourly_rate?: number | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          attendees_count: number
          duration_minutes: number
          average_hourly_rate: number
          total_cost: number | null
          currency: string | null
          meeting_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          attendees_count: number
          duration_minutes: number
          average_hourly_rate: number
          currency?: string | null
          meeting_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          attendees_count?: number
          duration_minutes?: number
          average_hourly_rate?: number
          currency?: string | null
          meeting_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

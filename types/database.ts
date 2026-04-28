export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type TitleType = 'movie' | 'tv'
export type InteractionType = 'watched' | 'watchlist' | 'liked' | 'disliked'
export type Mood = 'happy' | 'sad' | 'excited' | 'relaxed' | 'tense' | 'romantic'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      user_platforms: {
        Row: {
          id: string
          user_id: string
          platform_name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform_name: string
          created_at?: string
        }
        Update: {
          platform_name?: string
        }
      }
      titles: {
        Row: {
          id: string
          tmdb_id: number
          type: TitleType
          title: string
          overview: string | null
          genres: string[]
          release_year: number | null
          runtime_minutes: number | null
          poster_url: string | null
          platforms: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tmdb_id: number
          type: TitleType
          title: string
          overview?: string | null
          genres?: string[]
          release_year?: number | null
          runtime_minutes?: number | null
          poster_url?: string | null
          platforms?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          overview?: string | null
          genres?: string[]
          release_year?: number | null
          runtime_minutes?: number | null
          poster_url?: string | null
          platforms?: string[]
          updated_at?: string
        }
      }
      user_title_interactions: {
        Row: {
          id: string
          user_id: string
          title_id: string
          interaction_type: InteractionType
          rating: number | null
          interacted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title_id: string
          interaction_type: InteractionType
          rating?: number | null
          interacted_at?: string
          created_at?: string
        }
        Update: {
          interaction_type?: InteractionType
          rating?: number | null
          interacted_at?: string
        }
      }
      recommendation_sessions: {
        Row: {
          id: string
          user_id: string
          mood: Mood
          available_time_minutes: number
          selected_platforms: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: Mood
          available_time_minutes: number
          selected_platforms?: string[]
          created_at?: string
        }
        Update: never
      }
      recommendation_results: {
        Row: {
          id: string
          session_id: string
          title_id: string
          rank: number
          confidence_score: number
          reasoning: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          title_id: string
          rank: number
          confidence_score: number
          reasoning?: string | null
          created_at?: string
        }
        Update: never
      }
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      features: {
        Row: {
          id: string
          title: string
          description: string
          status: 'proposed' | 'planned' | 'in_progress' | 'completed' | 'rejected'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: 'proposed' | 'planned' | 'in_progress' | 'completed' | 'rejected'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'proposed' | 'planned' | 'in_progress' | 'completed' | 'rejected'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      feature_votes: {
        Row: {
          id: string
          feature_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
          created_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
          created_at?: string
        }
        Update: {
          id?: string
          feature_id?: string
          user_id?: string
          vote_type?: 'upvote' | 'downvote'
          created_at?: string
        }
      }
      feature_comments: {
        Row: {
          id: string
          feature_id: string
          user_id: string
          comment_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          user_id: string
          comment_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          feature_id?: string
          user_id?: string
          comment_text?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      list_features: {
        Args: { filter_status?: string }
        Returns: {
          id: string
          title: string
          description: string
          status: string
          created_by: string
          created_at: string
          updated_at: string
          upvote_count: number
          downvote_count: number
          comment_count: number
          user_vote: 'upvote' | 'downvote' | null
        }[]
      }
      create_feature: {
        Args: {
          p_title: string
          p_description: string
          p_status?: string
        }
        Returns: string
      }
      toggle_vote: {
        Args: {
          p_feature_id: string
          p_vote_type: 'upvote' | 'downvote'
        }
        Returns: void
      }
      add_comment: {
        Args: {
          p_feature_id: string
          p_comment_text: string
        }
        Returns: string
      }
    }
  }
}

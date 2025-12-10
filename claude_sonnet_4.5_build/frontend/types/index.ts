import { Database } from './database.types'

export type Feature = Database['public']['Functions']['list_features']['Returns'][0]

export type FeatureStatus = 'proposed' | 'planned' | 'in_progress' | 'completed' | 'rejected'

export type VoteType = 'upvote' | 'downvote'

export interface Comment {
  id: string
  feature_id: string
  user_id: string
  comment_text: string
  created_at: string
  updated_at: string
}

export interface CreateFeatureInput {
  title: string
  description: string
  status?: FeatureStatus
}

export interface VoteInput {
  feature_id: string
  vote_type: VoteType
}

export interface CommentInput {
  feature_id: string
  comment_text: string
}

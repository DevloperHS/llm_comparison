import { supabase } from './supabase'
import type { Feature, CreateFeatureInput, VoteType, CommentInput } from '@/types'

export class FeatureAPI {
  static async listFeatures(filterStatus?: string): Promise<Feature[]> {
    const { data, error } = await supabase.rpc('list_features', {
      filter_status: filterStatus || null,
    })

    if (error) {
      throw new Error(`Failed to fetch features: ${error.message}`)
    }

    return data || []
  }

  static async createFeature(input: CreateFeatureInput): Promise<string> {
    const { data, error } = await supabase.rpc('create_feature', {
      p_title: input.title,
      p_description: input.description,
      p_status: input.status || 'proposed',
    })

    if (error) {
      throw new Error(`Failed to create feature: ${error.message}`)
    }

    return data
  }

  static async toggleVote(featureId: string, voteType: VoteType): Promise<void> {
    const { error } = await supabase.rpc('toggle_vote', {
      p_feature_id: featureId,
      p_vote_type: voteType,
    })

    if (error) {
      throw new Error(`Failed to toggle vote: ${error.message}`)
    }
  }

  static async addComment(input: CommentInput): Promise<string> {
    const { data, error } = await supabase.rpc('add_comment', {
      p_feature_id: input.feature_id,
      p_comment_text: input.comment_text,
    })

    if (error) {
      throw new Error(`Failed to add comment: ${error.message}`)
    }

    return data
  }

  static async getComments(featureId: string) {
    const { data, error } = await supabase
      .from('feature_comments')
      .select('*')
      .eq('feature_id', featureId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`)
    }

    return data || []
  }
}

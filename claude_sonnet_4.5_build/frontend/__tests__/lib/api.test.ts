import { FeatureAPI } from '@/lib/api'
import { supabase } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
  },
}))

describe('FeatureAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('listFeatures', () => {
    it('calls supabase.rpc with correct parameters', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Test Feature',
          description: 'Test Description',
          status: 'proposed',
          upvote_count: 5,
          downvote_count: 2,
          comment_count: 3,
          user_vote: null,
          created_by: 'user1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ]

      ;(supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await FeatureAPI.listFeatures()

      expect(supabase.rpc).toHaveBeenCalledWith('list_features', {
        filter_status: null,
      })
      expect(result).toEqual(mockData)
    })

    it('calls supabase.rpc with filter status', async () => {
      ;(supabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      })

      await FeatureAPI.listFeatures('proposed')

      expect(supabase.rpc).toHaveBeenCalledWith('list_features', {
        filter_status: 'proposed',
      })
    })

    it('throws error when supabase returns error', async () => {
      ;(supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(FeatureAPI.listFeatures()).rejects.toThrow(
        'Failed to fetch features: Database error'
      )
    })
  })

  describe('createFeature', () => {
    it('calls supabase.rpc with correct parameters', async () => {
      const mockId = 'new-feature-id'
      ;(supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockId,
        error: null,
      })

      const input = {
        title: 'New Feature',
        description: 'Feature description',
        status: 'proposed' as const,
      }

      const result = await FeatureAPI.createFeature(input)

      expect(supabase.rpc).toHaveBeenCalledWith('create_feature', {
        p_title: input.title,
        p_description: input.description,
        p_status: input.status,
      })
      expect(result).toBe(mockId)
    })
  })

  describe('toggleVote', () => {
    it('calls supabase.rpc with correct parameters', async () => {
      ;(supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      })

      await FeatureAPI.toggleVote('feature-id', 'upvote')

      expect(supabase.rpc).toHaveBeenCalledWith('toggle_vote', {
        p_feature_id: 'feature-id',
        p_vote_type: 'upvote',
      })
    })
  })

  describe('addComment', () => {
    it('calls supabase.rpc with correct parameters', async () => {
      const mockId = 'new-comment-id'
      ;(supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockId,
        error: null,
      })

      const input = {
        feature_id: 'feature-id',
        comment_text: 'Test comment',
      }

      const result = await FeatureAPI.addComment(input)

      expect(supabase.rpc).toHaveBeenCalledWith('add_comment', {
        p_feature_id: input.feature_id,
        p_comment_text: input.comment_text,
      })
      expect(result).toBe(mockId)
    })
  })
})

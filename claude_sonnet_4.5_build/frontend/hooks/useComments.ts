import { useState, useEffect, useCallback } from 'react'
import { FeatureAPI } from '@/lib/api'
import type { Comment } from '@/types'

export function useComments(featureId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!featureId) return

    try {
      setLoading(true)
      setError(null)
      const data = await FeatureAPI.getComments(featureId)
      setComments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }, [featureId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const refetch = useCallback(() => {
    fetchComments()
  }, [fetchComments])

  return {
    comments,
    loading,
    error,
    refetch,
  }
}

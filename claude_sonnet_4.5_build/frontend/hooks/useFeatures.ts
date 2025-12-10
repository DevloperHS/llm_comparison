import { useState, useEffect, useCallback } from 'react'
import { FeatureAPI } from '@/lib/api'
import type { Feature, FeatureStatus } from '@/types'

export function useFeatures(initialStatus?: FeatureStatus) {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | 'all'>(
    initialStatus || 'all'
  )

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await FeatureAPI.listFeatures(
        filterStatus === 'all' ? undefined : filterStatus
      )
      setFeatures(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch features')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  const refetch = useCallback(() => {
    fetchFeatures()
  }, [fetchFeatures])

  return {
    features,
    loading,
    error,
    filterStatus,
    setFilterStatus,
    refetch,
  }
}

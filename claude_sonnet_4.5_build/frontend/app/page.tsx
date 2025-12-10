'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useFeatures } from '@/hooks/useFeatures'
import { FeatureAPI } from '@/lib/api'
import { FeatureCard } from '@/components/features/FeatureCard'
import { FilterBar } from '@/components/features/FilterBar'
import { CreateFeatureModal } from '@/components/features/CreateFeatureModal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { VoteType, CreateFeatureInput, FeatureStatus } from '@/types'

export default function HomePage() {
  const { features, loading, error, filterStatus, setFilterStatus, refetch } =
    useFeatures()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleVote = async (featureId: string, voteType: VoteType) => {
    try {
      await FeatureAPI.toggleVote(featureId, voteType)
      await refetch()
      toast.success(`Vote ${voteType === 'upvote' ? 'added' : 'recorded'}!`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to vote'
      )
    }
  }

  const handleCreateFeature = async (data: CreateFeatureInput) => {
    try {
      await FeatureAPI.createFeature(data)
      await refetch()
      toast.success('Feature created successfully!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create feature'
      )
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <FilterBar
        selectedStatus={filterStatus}
        onStatusChange={(status: FeatureStatus | 'all') => setFilterStatus(status)}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {loading && (
        <div className="py-12">
          <LoadingSpinner size="lg" />
          <p className="text-center mt-4 text-gray-600">Loading features...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {!loading && !error && features.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No features found
          </h3>
          <p className="text-gray-500 mb-4">
            {filterStatus === 'all'
              ? 'Get started by creating your first feature proposal'
              : `No features with status "${filterStatus}"`}
          </p>
        </div>
      )}

      {!loading && !error && features.length > 0 && (
        <div className="space-y-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onVote={handleVote}
            />
          ))}
        </div>
      )}

      <CreateFeatureModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFeature}
      />
    </div>
  )
}

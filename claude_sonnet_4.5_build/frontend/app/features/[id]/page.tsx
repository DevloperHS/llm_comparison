'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { FeatureAPI } from '@/lib/api'
import { useComments } from '@/hooks/useComments'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { VoteButton } from '@/components/features/VoteButton'
import { CommentList } from '@/components/features/CommentList'
import { CommentForm } from '@/components/features/CommentForm'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Feature, VoteType } from '@/types'

export default function FeatureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const featureId = params.id as string

  const [feature, setFeature] = useState<Feature | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { comments, loading: commentsLoading, refetch: refetchComments } =
    useComments(featureId)

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        setLoading(true)
        const features = await FeatureAPI.listFeatures()
        const found = features.find((f) => f.id === featureId)
        if (found) {
          setFeature(found)
        } else {
          setError('Feature not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feature')
      } finally {
        setLoading(false)
      }
    }

    if (featureId) {
      fetchFeature()
    }
  }, [featureId])

  const handleVote = async (voteType: VoteType) => {
    if (!feature) return

    try {
      await FeatureAPI.toggleVote(featureId, voteType)
      const features = await FeatureAPI.listFeatures()
      const updated = features.find((f) => f.id === featureId)
      if (updated) {
        setFeature(updated)
      }
      toast.success(`Vote ${voteType === 'upvote' ? 'added' : 'recorded'}!`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to vote'
      )
    }
  }

  const handleAddComment = async (commentText: string) => {
    try {
      await FeatureAPI.addComment({
        feature_id: featureId,
        comment_text: commentText,
      })
      await refetchComments()
      if (feature) {
        setFeature({
          ...feature,
          comment_count: feature.comment_count + 1,
        })
      }
      toast.success('Comment added successfully!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add comment'
      )
      throw error
    }
  }

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
        <p className="text-center mt-4 text-gray-600">Loading feature...</p>
      </div>
    )
  }

  if (error || !feature) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || 'Feature not found'}</p>
          <Button onClick={() => router.push('/')}>Back to Features</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-4"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Features
      </Button>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {feature.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <Badge status={feature.status} />
              <span>{new Date(feature.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <VoteButton
            featureId={feature.id}
            upvoteCount={feature.upvote_count}
            downvoteCount={feature.downvote_count}
            userVote={feature.user_vote}
            onVote={handleVote}
          />
        </div>

        <div className="prose max-w-none">
          <p className="text-base sm:text-lg text-gray-700 whitespace-pre-wrap break-words">
            {feature.description}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="font-medium">
              {feature.upvote_count - feature.downvote_count} net votes
            </span>
            <span className="text-gray-400">•</span>
            <span>
              {feature.comment_count}{' '}
              {feature.comment_count === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>
        <div className="space-y-6">
          <CommentForm featureId={featureId} onSubmit={handleAddComment} />
          <div className="border-t border-gray-200 pt-6">
            <CommentList comments={comments} loading={commentsLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}

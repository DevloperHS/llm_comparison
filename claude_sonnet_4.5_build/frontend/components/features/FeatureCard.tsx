'use client'

import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { VoteButton } from './VoteButton'
import type { Feature, VoteType } from '@/types'

interface FeatureCardProps {
  feature: Feature
  onVote: (featureId: string, voteType: VoteType) => Promise<void>
}

export function FeatureCard({ feature, onVote }: FeatureCardProps) {
  const handleVote = async (voteType: VoteType) => {
    await onVote(feature.id, voteType)
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/features/${feature.id}`}
            className="group"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {feature.title}
            </h3>
          </Link>
          <p className="mt-2 text-sm sm:text-base text-gray-600 line-clamp-2">
            {feature.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <Badge status={feature.status} />
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {feature.comment_count} {feature.comment_count === 1 ? 'comment' : 'comments'}
            </span>
            <span className="hidden sm:inline">
              {new Date(feature.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-2">
          <VoteButton
            featureId={feature.id}
            upvoteCount={feature.upvote_count}
            downvoteCount={feature.downvote_count}
            userVote={feature.user_vote}
            onVote={handleVote}
          />
        </div>
      </div>
    </div>
  )
}

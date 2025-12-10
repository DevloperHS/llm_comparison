'use client'

import React, { useState } from 'react'
import type { VoteType } from '@/types'

interface VoteButtonProps {
  featureId: string
  upvoteCount: number
  downvoteCount: number
  userVote: VoteType | null
  onVote: (voteType: VoteType) => Promise<void>
}

export function VoteButton({
  featureId,
  upvoteCount,
  downvoteCount,
  userVote,
  onVote,
}: VoteButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleVote = async (voteType: VoteType) => {
    setLoading(true)
    try {
      await onVote(voteType)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('upvote')}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
          userVote === 'upvote'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium text-sm">{upvoteCount}</span>
      </button>
      <button
        onClick={() => handleVote('downvote')}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
          userVote === 'downvote'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium text-sm">{downvoteCount}</span>
      </button>
    </div>
  )
}

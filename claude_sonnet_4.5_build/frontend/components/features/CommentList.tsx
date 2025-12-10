'use client'

import React from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Comment } from '@/types'

interface CommentListProps {
  comments: Comment[]
  loading: boolean
}

export function CommentList({ comments, loading }: CommentListProps) {
  if (loading) {
    return <LoadingSpinner size="md" className="py-8" />
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
        <p>No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <p className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap break-words">
            {comment.comment_text}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <span>{new Date(comment.created_at).toLocaleString()}</span>
            {comment.updated_at !== comment.created_at && (
              <span className="italic">(edited)</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

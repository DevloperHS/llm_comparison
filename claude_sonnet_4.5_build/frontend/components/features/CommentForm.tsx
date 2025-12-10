'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

interface CommentFormProps {
  featureId: string
  onSubmit: (commentText: string) => Promise<void>
}

export function CommentForm({ featureId, onSubmit }: CommentFormProps) {
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!commentText.trim()) {
      setError('Comment cannot be empty')
      return
    }

    if (commentText.length < 3) {
      setError('Comment must be at least 3 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit(commentText)
      setCommentText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Add a comment..."
        rows={3}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        error={error}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button type="submit" loading={loading} disabled={!commentText.trim()}>
          Post Comment
        </Button>
      </div>
    </form>
  )
}

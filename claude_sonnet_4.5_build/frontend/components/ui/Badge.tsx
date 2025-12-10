import React from 'react'
import type { FeatureStatus } from '@/types'

interface BadgeProps {
  status: FeatureStatus
  className?: string
}

export function Badge({ status, className = '' }: BadgeProps) {
  const statusConfig: Record<FeatureStatus, { label: string; classes: string }> = {
    proposed: {
      label: 'Proposed',
      classes: 'bg-blue-100 text-blue-800',
    },
    planned: {
      label: 'Planned',
      classes: 'bg-purple-100 text-purple-800',
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-yellow-100 text-yellow-800',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-green-100 text-green-800',
    },
    rejected: {
      label: 'Rejected',
      classes: 'bg-red-100 text-red-800',
    },
  }

  // Fallback to 'proposed' style if status is not found
  const config = statusConfig[status] || statusConfig.proposed

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  )
}

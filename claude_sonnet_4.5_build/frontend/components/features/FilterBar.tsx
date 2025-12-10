'use client'

import React from 'react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { FeatureStatus } from '@/types'

interface FilterBarProps {
  selectedStatus: FeatureStatus | 'all'
  onStatusChange: (status: FeatureStatus | 'all') => void
  onCreateClick: () => void
}

export function FilterBar({
  selectedStatus,
  onStatusChange,
  onCreateClick,
}: FilterBarProps) {
  const statusOptions = [
    { value: 'all', label: 'All Features' },
    { value: 'proposed', label: 'Proposed' },
    { value: 'planned', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-xs">
          <Select
            label="Filter by Status"
            options={statusOptions}
            value={selectedStatus}
            onChange={(e) =>
              onStatusChange(e.target.value as FeatureStatus | 'all')
            }
          />
        </div>
        <Button onClick={onCreateClick} className="w-full sm:w-auto">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Feature
        </Button>
      </div>
    </div>
  )
}

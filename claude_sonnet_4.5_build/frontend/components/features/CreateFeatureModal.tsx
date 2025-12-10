'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { CreateFeatureInput, FeatureStatus } from '@/types'

interface CreateFeatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateFeatureInput) => Promise<void>
}

export function CreateFeatureModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateFeatureModalProps) {
  const [formData, setFormData] = useState<CreateFeatureInput>({
    title: '',
    description: '',
    status: 'proposed',
  })
  const [errors, setErrors] = useState<Partial<CreateFeatureInput>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Partial<CreateFeatureInput> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      await onSubmit(formData)
      setFormData({ title: '', description: '', status: 'proposed' })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Failed to create feature:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: 'proposed', label: 'Proposed' },
    { value: 'planned', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Feature"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="ml-2">
            Create Feature
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          type="text"
          placeholder="Enter feature title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          error={errors.title}
          required
        />
        <Textarea
          label="Description"
          placeholder="Describe the feature in detail"
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          error={errors.description}
          required
        />
        <Select
          label="Status"
          options={statusOptions}
          value={formData.status || 'proposed'}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as FeatureStatus,
            })
          }
        />
      </form>
    </Modal>
  )
}

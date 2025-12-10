import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'

describe('Badge Component', () => {
  it('renders proposed status correctly', () => {
    render(<Badge status="proposed" />)
    expect(screen.getByText('Proposed')).toBeInTheDocument()
    expect(screen.getByText('Proposed')).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('renders planned status correctly', () => {
    render(<Badge status="planned" />)
    expect(screen.getByText('Planned')).toBeInTheDocument()
    expect(screen.getByText('Planned')).toHaveClass('bg-purple-100', 'text-purple-800')
  })

  it('renders in_progress status correctly', () => {
    render(<Badge status="in_progress" />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('renders completed status correctly', () => {
    render(<Badge status="completed" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('renders rejected status correctly', () => {
    render(<Badge status="rejected" />)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toHaveClass('bg-red-100', 'text-red-800')
  })

  it('applies custom className', () => {
    render(<Badge status="proposed" className="custom-class" />)
    expect(screen.getByText('Proposed')).toHaveClass('custom-class')
  })
})

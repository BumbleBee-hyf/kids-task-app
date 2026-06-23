import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskCard from '../components/TaskCard'
import type { Task } from '../types'

// ============ Mock Task Data ============
const mockPendingTask: Task = {
  id: 'task-1',
  parentId: 'parent-1',
  studentId: 'student-1',
  name: '背诵古诗',
  quantity: 1,
  basePoints: 10,
  taskType: 'daily',
  status: 'pending',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const mockSubmittedTask: Task = {
  ...mockPendingTask,
  id: 'task-2',
  status: 'submitted',
  submittedAt: '2026-01-01T10:00:00.000Z',
}

const mockApprovedTask: Task = {
  ...mockPendingTask,
  id: 'task-3',
  status: 'approved',
  rating: 'excellent',
  finalPoints: 10,
  submittedAt: '2026-01-01T10:00:00.000Z',
  approvedAt: '2026-01-01T11:00:00.000Z',
}

const mockRejectedTask: Task = {
  ...mockPendingTask,
  id: 'task-4',
  status: 'rejected',
  submittedAt: '2026-01-01T10:00:00.000Z',
  approvedAt: '2026-01-01T11:00:00.000Z',
}

const mockPeriodicTask: Task = {
  ...mockPendingTask,
  id: 'task-5',
  taskType: 'periodic',
  weekdays: [1, 3, 5],
}

describe('TaskCard', () => {
  it('renders task name', () => {
    render(<TaskCard task={mockPendingTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText('背诵古诗')).toBeDefined()
  })

  it('renders task quantity', () => {
    render(<TaskCard task={mockPendingTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText('1')).toBeDefined()
  })

  it('renders task base points', () => {
    render(<TaskCard task={mockPendingTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText('10')).toBeDefined()
  })

  it('renders pending status badge', () => {
    render(<TaskCard task={mockPendingTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText(/待提交/)).toBeDefined()
  })

  it('renders submitted status badge', () => {
    render(<TaskCard task={mockSubmittedTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText(/待审批/)).toBeDefined()
  })

  it('renders approved status badge with rating', () => {
    render(<TaskCard task={mockApprovedTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText(/已通过/)).toBeDefined()
    expect(screen.getByText(/优秀/)).toBeDefined()
    expect(screen.getByText(/10 积分/)).toBeDefined()
  })

  it('renders rejected status badge', () => {
    render(<TaskCard task={mockRejectedTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText(/已拒绝/)).toBeDefined()
  })

  it('shows submit button for pending tasks', () => {
    render(<TaskCard task={mockPendingTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText(/提交完成/)).toBeDefined()
  })

  it('hides submit button for non-pending tasks', () => {
    render(<TaskCard task={mockSubmittedTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.queryByText(/提交完成/)).toBeNull()
  })

  it('disables submit button when submitting', () => {
    render(<TaskCard task={mockPendingTask} onSubmit={vi.fn()} submitting={true} />)
    const button = screen.getByText(/提交中/)
    expect(button).toBeDefined()
  })

  it('calls onSubmit when submit button clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TaskCard task={mockPendingTask} onSubmit={onSubmit} submitting={false} />)

    await user.click(screen.getByText(/提交完成/))
    expect(onSubmit).toHaveBeenCalledWith('task-1')
  })

  it('renders task type badge for daily task', () => {
    render(<TaskCard task={mockPendingTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText('每日任务')).toBeDefined()
  })

  it('renders periodic task weekdays', () => {
    render(<TaskCard task={mockPeriodicTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText(/周一/)).toBeDefined()
    expect(screen.getByText(/周三/)).toBeDefined()
    expect(screen.getByText(/周五/)).toBeDefined()
  })

  it('renders good rating correctly', () => {
    const goodTask: Task = {
      ...mockApprovedTask,
      rating: 'good',
      finalPoints: 8, // 80% of 10
    }
    render(<TaskCard task={goodTask} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByText(/良好/)).toBeDefined()
  })
})

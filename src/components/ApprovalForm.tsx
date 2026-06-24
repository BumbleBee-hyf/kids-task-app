import type { Task, TaskRating } from '../types'

interface Props {
  task: Task
  studentName: string
  onApprove: (taskId: string, rating: TaskRating) => void
  onReject: (taskId: string) => void
  processing: boolean
}

export default function ApprovalForm({
  task,
  studentName,
  onApprove,
  onReject,
  processing,
}: Props) {
  const excellentPoints = task.basePoints
  const goodPoints = Math.floor(task.basePoints * 0.8)

  return (
    <div className="card approval-card">
      {/* 任务信息区 */}
      <div className="approval-task-info">
        <div className="approval-task-left">
          <div className="approval-task-icon">📋</div>
          <div className="approval-task-detail">
            <div className="approval-task-name">{task.name}</div>
            <div className="approval-task-meta">
              <span className="approval-meta-item">
                <span className="approval-meta-label">学生</span>
                <span className="approval-meta-value">{studentName}</span>
              </span>
              <span className="approval-meta-divider">·</span>
              <span className="approval-meta-item">
                <span className="approval-meta-label">任务量</span>
                <span className="approval-meta-value">{task.quantity}</span>
              </span>
              <span className="approval-meta-divider">·</span>
              <span className="approval-meta-item">
                <span className="approval-meta-label">基础积分</span>
                <span className="approval-meta-value approval-meta-points">{task.basePoints}</span>
              </span>
            </div>
            {task.submittedAt && (
              <div className="approval-task-time">
                提交于 {new Date(task.submittedAt).toLocaleString('zh-CN')}
              </div>
            )}
          </div>
        </div>
        <span className="status-badge status-submitted">待审批</span>
      </div>

      {/* 操作区 */}
      <div className="approval-actions">
        <button
          className="approval-action-btn approval-btn-excellent"
          onClick={() => onApprove(task.id, 'excellent')}
          disabled={processing}
        >
          <span className="approval-btn-icon">🌟</span>
          <span className="approval-btn-label">优秀</span>
          <span className="approval-btn-points">+{excellentPoints} 积分</span>
        </button>
        <button
          className="approval-action-btn approval-btn-good"
          onClick={() => onApprove(task.id, 'good')}
          disabled={processing}
        >
          <span className="approval-btn-icon">👍</span>
          <span className="approval-btn-label">良好</span>
          <span className="approval-btn-points">+{goodPoints} 积分</span>
        </button>
        <button
          className="approval-action-btn approval-btn-reject"
          onClick={() => onReject(task.id)}
          disabled={processing}
        >
          <span className="approval-btn-icon">✕</span>
          <span className="approval-btn-label">驳回</span>
        </button>
      </div>
    </div>
  )
}

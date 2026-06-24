import type { Task, TaskType } from '../types'

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const taskTypeLabel: Record<TaskType, string> = {
  temporary: '临时任务',
  daily: '每日任务',
  periodic: '周期任务',
}

interface Props {
  task: Task
  onSubmit: (taskId: string) => void
  submitting: boolean
}

const statusLabel: Record<string, string> = {
  pending: '待提交',
  submitted: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
}

const statusEmoji: Record<string, string> = {
  pending: '📌',
  submitted: '⏳',
  approved: '✅',
  rejected: '❌',
}

export default function TaskCard({ task, onSubmit, submitting }: Props) {
  const isPending = task.status === 'pending'
  const isApproved = task.status === 'approved'
  const taskType = task.taskType || 'temporary'

  const getWeekdaysText = () => {
    if (!task.weekdays || task.weekdays.length === 0) return ''
    return task.weekdays.map((d) => WEEKDAY_LABELS[d - 1]).join('、')
  }

  return (
    <div className="card task-card" data-status={task.status}>
      <div className="task-card-header">
        <span className={`status-badge status-${task.status}`}>
          {statusEmoji[task.status]} {statusLabel[task.status]}
        </span>
        <span className={`task-type-badge type-${taskType}`}>{taskTypeLabel[taskType]}</span>
      </div>

      <div className="task-card-body">
        <h3 className="task-card-title">{task.name}</h3>
        <div className="task-card-info">
          <span>
            任务量：<strong>{task.quantity}</strong>
          </span>
          <span>
            基础积分：<strong className="points">{task.basePoints}</strong>
          </span>
        </div>

        {taskType === 'periodic' && task.weekdays && task.weekdays.length > 0 && (
          <div className="task-card-weekdays">{getWeekdaysText()}</div>
        )}

        {isApproved && task.rating && (
          <div className="task-rating-box">
            <span>评级：{task.rating === 'excellent' ? '🌟 优秀' : '👍 良好'}</span>
            <span className="task-rating-points">获得 {task.finalPoints} 积分</span>
          </div>
        )}

        {task.status === 'rejected' && <div className="task-reject-box">任务未通过审批</div>}
      </div>

      {isPending && (
        <div className="task-card-footer">
          <button
            className="btn btn-primary"
            onClick={() => onSubmit(task.id)}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '提交完成 ✅'}
          </button>
        </div>
      )}

      {task.submittedAt && (
        <div className="task-meta-time">
          提交时间：{new Date(task.submittedAt).toLocaleString('zh-CN')}
        </div>
      )}
    </div>
  )
}

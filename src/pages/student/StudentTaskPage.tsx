import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTasks } from '../../contexts/TaskContext'
import TaskCard from '../../components/TaskCard'
import '../../styles/TaskManagement.module.css'

export default function StudentTaskPage() {
  const { user } = useAuth()
  const { getTasksByStudent, submitTask, refreshTasks } = useTasks()
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  useEffect(() => {
    refreshTasks()
  }, [refreshTasks])

  if (!user) return null
  const myTasks = getTasksByStudent(user.id)

  const pendingTasks = myTasks.filter((t) => t.status === 'pending')
  const otherTasks = myTasks.filter((t) => t.status !== 'pending')

  const handleSubmit = async (taskId: string) => {
    setSubmittingId(taskId)
    try {
      await submitTask(taskId, user.id)
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">我的任务</h1>

      {myTasks.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">📭</span>
          <p>还没有任务，等待家长给你布置任务吧！</p>
        </div>
      ) : (
        <>
          {pendingTasks.length > 0 && (
            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h2 className="section-title section-title-warning">
                待提交 ({pendingTasks.length})
              </h2>
              <div className="task-cards">
                {pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSubmit={handleSubmit}
                    submitting={submittingId === task.id}
                  />
                ))}
              </div>
            </section>
          )}

          {otherTasks.length > 0 && (
            <section>
              <h2 className="section-title">历史记录 ({otherTasks.length})</h2>
              <div className="task-cards">
                {otherTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onSubmit={() => {}} submitting={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

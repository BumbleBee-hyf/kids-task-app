import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTasks } from '../../contexts/TaskContext'
import { usePoints } from '../../contexts/PointsContext'
import { voucherStorage, checkinStorage } from '../../services/storageService'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { getTasksByStudent, refreshTasks } = useTasks()
  const { balance: pointBalance, refreshBalance } = usePoints()
  const navigate = useNavigate()
  const [voucherBalance, setVoucherBalance] = useState(0)
  const [checkinStatus, setCheckinStatus] = useState<{
    checkedInToday: boolean
    streak: number
    hasCompletedTask: boolean
    checkinPoints: number
  }>({ checkedInToday: false, streak: 0, hasCompletedTask: false, checkinPoints: 10 })
  const [checkinLoading, setCheckinLoading] = useState(false)

  const loadAllData = async () => {
    if (!user) return
    refreshTasks()
    await refreshBalance(user.id)
    const bal = await voucherStorage.getBalance(user.id)
    setVoucherBalance(bal)
    const status = await checkinStorage.getStatus(user.id)
    setCheckinStatus(status)
  }

  useEffect(() => {
    if (!user) return
    loadAllData()
  }, [user?.id])

  // 页面获得焦点时刷新余额
  useEffect(() => {
    if (!user) return
    const onFocus = () => {
      loadAllData()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [user?.id])

  if (!user) return null
  const myTasks = getTasksByStudent(user.id)
  const pendingCount = myTasks.filter((t) => t.status === 'pending').length
  const submittedCount = myTasks.filter((t) => t.status === 'submitted').length
  const approvedCount = myTasks.filter((t) => t.status === 'approved').length
  const todayApproved = myTasks.filter((t) => {
    if (t.status !== 'approved' || !t.approvedAt) return false
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return t.approvedAt.startsWith(today)
  })
  const todayPoints = todayApproved.reduce((sum, t) => sum + (t.finalPoints || 0), 0)

  const handleCheckin = async () => {
    if (!user || checkinLoading) return
    setCheckinLoading(true)
    try {
      const result = await checkinStorage.checkin(user.id)
      if (result.success) {
        await refreshBalance(user.id)
        setCheckinStatus((prev) => ({
          ...prev,
          checkedInToday: true,
          streak: result.streak,
        }))
      }
    } catch (err: any) {
      alert(err.message || '签到失败')
    } finally {
      setCheckinLoading(false)
    }
  }

  // 签到按钮状态
  const checkinDisabled =
    checkinStatus.checkedInToday || !checkinStatus.hasCompletedTask || checkinLoading
  const checkinLabel = checkinStatus.checkedInToday
    ? '✅ 已签到'
    : !checkinStatus.hasCompletedTask
      ? '🔒 完成任务后可签到'
      : checkinLoading
        ? '签到中...'
        : `🎁 签到领${checkinStatus.checkinPoints}积分`

  return (
    <div className="page-container">
      {/* 欢迎卡片 */}
      <div className="welcome-card">
        <div className="welcome-left">
          <div className="welcome-avatar">👦</div>
          <div className="welcome-text">
            <div className="welcome-greeting">你好，{user?.displayName}！</div>
            <div className="welcome-subtitle">今天又是美好的一天 😊 加油鸭！</div>
          </div>
        </div>
        <div className="welcome-checkin">
          <div className="checkin-icon">📅</div>
          <div className="checkin-text">
            <div className="checkin-label">连续签到</div>
            <div className="checkin-days">
              {checkinStatus.streak}
              <span> 天</span>
            </div>
          </div>
          <div className="checkin-arrow">›</div>
        </div>
      </div>

      {/* 页面标题栏 */}
      <div className="page-header-bar">
        <div className="page-header-title">
          <span className="page-header-icon">🏠</span>
          学生首页
        </div>
        <div className="page-header-action">
          <button
            className={`btn btn-sm ${checkinStatus.checkedInToday ? 'btn-outline' : 'btn-primary'}`}
            onClick={handleCheckin}
            disabled={checkinDisabled}
          >
            {checkinLabel}
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div
          className="card card-orange stat-card-arrow"
          onClick={() => navigate('/student/tasks')}
        >
          <div className="stat-card-icon">📌</div>
          <div className="stat-card-value" style={{ color: 'var(--color-warning)' }}>
            {pendingCount}
          </div>
          <div className="stat-card-label">待完成任务</div>
        </div>
        <div
          className="card card-blue stat-card-arrow"
          onClick={() => navigate('/student/lottery')}
        >
          <div className="stat-card-icon">⭐</div>
          <div className="stat-card-value" style={{ color: 'var(--color-primary)' }}>
            {pointBalance}
          </div>
          <div className="stat-card-label">我的积分</div>
        </div>
        <div
          className="card card-green stat-card-arrow"
          onClick={() => navigate('/student/voucher')}
        >
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value" style={{ color: 'var(--color-secondary)' }}>
            {voucherBalance}
          </div>
          <div className="stat-card-label">代金券余额</div>
        </div>
      </div>

      {/* 今日统计 */}
      <div className="stats-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="stats-card-title">
          <span>📊</span>
          今日统计
        </div>
        <div className="stats-row">
          <div className="stat-item">
            <span>已提交：</span>
            <strong>{submittedCount}</strong>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span>已通过：</span>
            <strong style={{ color: 'var(--color-success)' }}>{approvedCount}</strong>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span>今日获得积分：</span>
            <strong style={{ color: 'var(--color-primary)' }}>+{todayPoints}</strong>
          </div>
        </div>
      </div>

      {/* CTA 按钮 */}
      <div className="grid-2">
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/student/tasks')}>
          📋 去做任务
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/student/lottery')}>
          🎰 去抽奖
        </button>
      </div>
    </div>
  )
}

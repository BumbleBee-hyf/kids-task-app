import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';

export default function ParentDashboard() {
  const { user } = useAuth();
  const { tasks, refreshTasks } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const totalTasks = tasks.filter(t => t.parentId === user?.id).length;
  const pendingApprovals = tasks.filter(t => t.status === 'submitted').length;
  const approvedToday = tasks.filter(t => {
    if (t.status !== 'approved' || !t.approvedAt) return false;
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return t.approvedAt.startsWith(today);
  }).length;

  return (
    <div className="page-container">
      {/* 欢迎卡片 */}
      <div className="welcome-card">
        <div className="welcome-left">
          <div className="welcome-avatar">👨‍👩‍👧</div>
          <div className="welcome-text">
            <div className="welcome-greeting">你好，{user?.displayName}！</div>
            <div className="welcome-subtitle">欢迎回来，今天也辛苦啦！</div>
          </div>
        </div>
      </div>

      {/* 页面标题栏 */}
      <div className="page-header-bar">
        <div className="page-header-title">
          <span className="page-header-icon">🏠</span>
          家长首页
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card card-blue stat-card-arrow" onClick={() => navigate('/parent/tasks')}>
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-value" style={{ color: 'var(--text-primary)' }}>{totalTasks}</div>
          <div className="stat-card-label">已发布任务</div>
        </div>
        <div className="card card-orange stat-card-arrow" onClick={() => navigate('/parent/approvals')}>
          <div className="stat-card-icon">⏳</div>
          <div className="stat-card-value" style={{ color: 'var(--color-warning)' }}>{pendingApprovals}</div>
          <div className="stat-card-label">待审批</div>
        </div>
        <div className="card card-green stat-card-arrow">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value" style={{ color: 'var(--color-success)' }}>{approvedToday}</div>
          <div className="stat-card-label">今日已审批</div>
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
            <span>已发布：</span>
            <strong>{totalTasks}</strong>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span>待审批：</span>
            <strong style={{ color: 'var(--color-warning)' }}>{pendingApprovals}</strong>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span>今日审批：</span>
            <strong style={{ color: 'var(--color-success)' }}>{approvedToday}</strong>
          </div>
        </div>
      </div>

      {/* CTA 按钮 */}
      <div className="grid-2">
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/parent/tasks')}>
          📝 管理任务
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/parent/approvals')}>
          ✅ 去审批
        </button>
      </div>
    </div>
  );
}

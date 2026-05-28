import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import { useVouchers } from '../../contexts/VoucherContext';
import { userStorage } from '../../services/storageService';
import type { TaskRating, User, WithdrawRequest } from '../../types';
import ApprovalForm from '../../components/ApprovalForm';
import '../../styles/TaskManagement.module.css';
import '../../styles/Voucher.module.css';

export default function ApprovalPage() {
  const { user } = useAuth();
  const { tasks, approveTask, rejectTask, refreshTasks } = useTasks();
  const { getPendingWithdraws, approveWithdraw, rejectWithdraw } = useVouchers();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'withdraws'>('tasks');
  const [students, setStudents] = useState<User[]>([]);
  const [pendingWithdraws, setPendingWithdraws] = useState<WithdrawRequest[]>([]);

  useEffect(() => {
    refreshTasks();
    userStorage.getStudents().then(setStudents);
  }, [refreshTasks]);

  const loadPendingWithdraws = useCallback(async () => {
    const list = await getPendingWithdraws();
    setPendingWithdraws(list);
  }, [getPendingWithdraws]);

  useEffect(() => {
    loadPendingWithdraws();
  }, [loadPendingWithdraws]);

  // Tab切换时刷新数据
  useEffect(() => {
    if (activeTab === 'tasks') {
      refreshTasks();
    } else {
      loadPendingWithdraws();
    }
  }, [activeTab, refreshTasks, loadPendingWithdraws]);

  const submittedTasks = tasks.filter(t => t.status === 'submitted');

  const getStudentName = (studentId: string) => {
    const s = students.find(u => u.id === studentId);
    return s?.displayName || '未知学生';
  };

  const handleApprove = async (taskId: string, rating: TaskRating) => {
    setProcessingId(taskId);
    try {
      await approveTask(taskId, rating);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (taskId: string) => {
    setProcessingId(taskId);
    try {
      await rejectTask(taskId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveWithdraw = async (id: string) => {
    if (!user) return;
    setProcessingId(id);
    try {
      await approveWithdraw(id, user.id);
      await loadPendingWithdraws();
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectWithdraw = async (id: string) => {
    if (!user) return;
    await rejectWithdraw(id, user.id);
    await loadPendingWithdraws();
  };

  return (
    <div className="page-container">
      <h1 className="page-title">审批中心</h1>

      <div className="tab-buttons">
        <button
          className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('tasks')}
        >
          任务审批 ({submittedTasks.length})
        </button>
        <button
          className={`btn ${activeTab === 'withdraws' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('withdraws')}
        >
          提现审批 ({pendingWithdraws.length})
        </button>
      </div>

      {activeTab === 'tasks' && (
        <>
          {submittedTasks.length === 0 ? (
            <div className="empty-state">
              <span className="emoji">🎉</span>
              <p>没有待审批的任务</p>
            </div>
          ) : (
            submittedTasks.map(task => (
              <ApprovalForm
                key={task.id}
                task={task}
                studentName={getStudentName(task.studentId)}
                onApprove={handleApprove}
                onReject={handleReject}
                processing={processingId === task.id}
              />
            ))
          )}
        </>
      )}

      {activeTab === 'withdraws' && (
        <>
          {pendingWithdraws.length === 0 ? (
            <div className="empty-state">
              <span className="emoji">🎉</span>
              <p>没有待审批的提现申请</p>
            </div>
          ) : (
            pendingWithdraws.map(w => (
              <div key={w.id} className="card withdraw-approval-card">
                <div className="withdraw-approval-info">
                  <span className="stat-emoji">💸</span>
                  <div>
                    <div className="withdraw-approval-amount">{w.amount} 元</div>
                    <div className="withdraw-approval-student">
                      申请人：{getStudentName(w.studentId)} &nbsp;|&nbsp;
                      {new Date(w.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
                <div className="withdraw-approval-actions">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleApproveWithdraw(w.id)}
                    disabled={processingId === w.id}
                  >
                    {processingId === w.id ? '处理中...' : '通过'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRejectWithdraw(w.id)}
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

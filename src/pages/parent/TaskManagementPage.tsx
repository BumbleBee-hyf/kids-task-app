import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import { userStorage } from '../../services/storageService';
import type { Task, User, TaskType } from '../../types';
import TaskForm from '../../components/TaskForm';
import '../../styles/TaskManagement.module.css';

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const taskTypeLabel: Record<TaskType, string> = {
  temporary: '临时',
  daily: '每日',
  periodic: '周期',
};

export default function TaskManagementPage() {
  const { user } = useAuth();
  const { getTemplatesByParent, getTasksByParent, createTask, updateTask, deleteTask, refreshTasks } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    refreshTasks();
    userStorage.getStudents().then(setStudents);
  }, [refreshTasks]);

  const templates = user ? getTemplatesByParent(user.id) : [];
  // 临时任务实例：有 taskDate 且 taskType 为 temporary
  const tempInstances = user
    ? getTasksByParent(user.id).filter(t => t.taskDate && t.taskType === 'temporary')
    : [];

  const getStudentDisplayName = (studentId: string) => {
    const s = students.find(u => u.id === studentId);
    return s?.displayName || '未知学生';
  };

  const getWeekdaysText = (weekdays?: number[]) => {
    if (!weekdays || weekdays.length === 0) return '';
    return weekdays.map(d => WEEKDAY_LABELS[d - 1]).join('、');
  };

  const handleCreate = async (data: { studentId: string; name: string; quantity: number; basePoints: number; taskType: TaskType; weekdays: number[] }) => {
    await createTask({ ...data, parentId: user!.id });
    setShowForm(false);
  };

  const handleUpdate = async (data: { studentId: string; name: string; quantity: number; basePoints: number; taskType: TaskType; weekdays: number[] }) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, {
      studentId: data.studentId,
      name: data.name,
      quantity: data.quantity,
      basePoints: data.basePoints,
      taskType: data.taskType,
      weekdays: data.taskType === 'periodic' ? data.weekdays : undefined,
    });
    setEditingTask(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      await deleteTask(id);
    }
  };

  const canEdit = (task: Task) => task.status === 'pending';

  const statusLabel: Record<string, string> = {
    pending: '待提交',
    submitted: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
  };

  const hasAny = templates.length > 0 || tempInstances.length > 0;

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>任务管理</h1>
        {!showForm && !editingTask && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + 发布新任务
          </button>
        )}
      </div>

      {showForm && (
        <TaskForm
          students={students}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTask && (
        <TaskForm
          students={students}
          initialData={{
            studentId: editingTask.studentId,
            name: editingTask.name,
            quantity: editingTask.quantity,
            basePoints: editingTask.basePoints,
            taskType: editingTask.taskType || 'temporary',
            weekdays: editingTask.weekdays || [],
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditingTask(null)}
          submitLabel="保存修改"
        />
      )}

      {!hasAny ? (
        <div className="empty-state">
          <span className="emoji">📭</span>
          <p>还没有发布任何任务</p>
        </div>
      ) : (
        <>
          {/* 任务模板区：每日/周期任务定义 */}
          {templates.length > 0 && (
            <>
              <h2 className="section-title" style={{ marginTop: 'var(--spacing-md)' }}>任务模板</h2>
              <div className="task-table-wrapper card">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>任务名称</th>
                      <th>类型</th>
                      <th>指派学生</th>
                      <th>任务量</th>
                      <th>积分</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map(task => (
                      <tr key={task.id}>
                        <td className="task-name">{task.name}</td>
                        <td>
                          <span className={`task-type-badge type-${task.taskType}`}>
                            {taskTypeLabel[task.taskType]}
                          </span>
                          {task.taskType === 'periodic' && task.weekdays && (
                            <span className="task-weekdays-hint">{getWeekdaysText(task.weekdays)}</span>
                          )}
                        </td>
                        <td>{getStudentDisplayName(task.studentId)}</td>
                        <td>{task.quantity}</td>
                        <td>
                          <span className="points">{task.basePoints}</span>
                        </td>
                        <td className="task-actions">
                          <button className="btn btn-sm btn-outline"
                            onClick={() => setEditingTask(task)}>编辑</button>
                          <button className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(task.id)}>删除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* 临时任务区 */}
          {tempInstances.length > 0 && (
            <>
              <h2 className="section-title" style={{ marginTop: 'var(--spacing-lg)' }}>临时任务</h2>
              <div className="task-table-wrapper card">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>任务名称</th>
                      <th>指派学生</th>
                      <th>任务量</th>
                      <th>积分</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempInstances.map(task => (
                      <tr key={task.id}>
                        <td className="task-name">{task.name}</td>
                        <td>{getStudentDisplayName(task.studentId)}</td>
                        <td>{task.quantity}</td>
                        <td>
                          <span className="points">{task.basePoints}</span>
                          {task.finalPoints !== undefined && (
                            <span className="final-points"> → {task.finalPoints}</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge status-${task.status}`}>
                            {statusLabel[task.status]}
                          </span>
                        </td>
                        <td className="task-actions">
                          {canEdit(task) && (
                            <>
                              <button className="btn btn-sm btn-outline"
                                onClick={() => setEditingTask(task)}>编辑</button>
                              <button className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(task.id)}>删除</button>
                            </>
                          )}
                          {task.status !== 'pending' && (
                            <span className="task-meta-time">--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

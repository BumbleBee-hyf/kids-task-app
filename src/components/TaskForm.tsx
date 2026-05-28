import { useState, useEffect } from 'react';
import type { User, TaskType } from '../types';

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

interface TaskFormData {
  studentId: string;
  name: string;
  quantity: number;
  basePoints: number;
  taskType: TaskType;
  weekdays: number[];
}

interface Props {
  students: User[];
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function TaskForm({ students, initialData, onSubmit, onCancel, submitLabel = '发布任务' }: Props) {
  const [studentId, setStudentId] = useState(initialData?.studentId || '');
  const [name, setName] = useState(initialData?.name || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [basePoints, setBasePoints] = useState(initialData?.basePoints || 10);
  const [taskType, setTaskType] = useState<TaskType>(initialData?.taskType || 'temporary');
  const [weekdays, setWeekdays] = useState<number[]>(initialData?.weekdays || []);
  const [error, setError] = useState('');

  useEffect(() => {
    if (students.length === 1 && !studentId) {
      setStudentId(students[0].id);
    }
  }, [students, studentId]);

  const toggleWeekday = (day: number) => {
    setWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!studentId) { setError('请选择学生'); return; }
    if (!name.trim()) { setError('请输入任务名称'); return; }
    if (quantity < 1) { setError('任务量至少为 1'); return; }
    if (basePoints < 1) { setError('积分至少为 1'); return; }
    if (taskType === 'periodic' && weekdays.length === 0) { setError('请选择周期日期'); return; }

    onSubmit({ studentId, name: name.trim(), quantity, basePoints, taskType, weekdays });
  };

  return (
    <form className="task-form card" onSubmit={handleSubmit}>
      <h3 className="form-title">
        {initialData ? '✏️ 编辑任务' : '📝 发布新任务'}
      </h3>

      <div className="form-group">
        <label className="form-label">指派学生</label>
        <select className="form-input" value={studentId} onChange={e => setStudentId(e.target.value)}>
          <option value="">-- 选择学生 --</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.displayName}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">任务名称</label>
        <input className="form-input" type="text" value={name}
          onChange={e => setName(e.target.value)} placeholder="如：背诵古诗一首" />
      </div>

      <div className="form-group">
        <label className="form-label">任务类型</label>
        <div className="task-type-selector">
          <label className={`task-type-option ${taskType === 'temporary' ? 'active' : ''}`}>
            <input type="radio" name="taskType" value="temporary"
              checked={taskType === 'temporary'} onChange={() => setTaskType('temporary')} />
            <span className="task-type-label">临时任务</span>
          </label>
          <label className={`task-type-option ${taskType === 'daily' ? 'active' : ''}`}>
            <input type="radio" name="taskType" value="daily"
              checked={taskType === 'daily'} onChange={() => setTaskType('daily')} />
            <span className="task-type-label">每日任务</span>
          </label>
          <label className={`task-type-option ${taskType === 'periodic' ? 'active' : ''}`}>
            <input type="radio" name="taskType" value="periodic"
              checked={taskType === 'periodic'} onChange={() => setTaskType('periodic')} />
            <span className="task-type-label">周期任务</span>
          </label>
        </div>
      </div>

      {taskType === 'periodic' && (
        <div className="form-group">
          <label className="form-label">选择周期日期</label>
          <div className="weekday-selector">
            {WEEKDAY_LABELS.map((label, i) => {
              const day = i + 1; // 1-7
              const selected = weekdays.includes(day);
              return (
                <button type="button" key={day}
                  className={`weekday-btn ${selected ? 'selected' : ''}`}
                  onClick={() => toggleWeekday(day)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="form-group grid-2">
        <div>
          <label className="form-label">任务量</label>
          <input className="form-input" type="number" min={1} value={quantity}
            onChange={e => setQuantity(Number(e.target.value))} />
        </div>
        <div>
          <label className="form-label">基础积分</label>
          <input className="form-input" type="number" min={1} value={basePoints}
            onChange={e => setBasePoints(Number(e.target.value))} />
        </div>
      </div>

      {error && <div className="login-error form-error-box">{error}</div>}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit">{submitLabel}</button>
        <button className="btn btn-outline" type="button" onClick={onCancel}>取消</button>
      </div>
    </form>
  );
}

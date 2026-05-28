import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Task, TaskRating } from '../types';
import { taskStorage } from '../services/storageService';

interface TaskContextType {
  tasks: Task[];
  refreshTasks: () => Promise<void>;
  getTasksByStudent: (studentId: string) => Task[];
  getTasksByParent: (parentId: string) => Task[];
  getTemplatesByParent: (parentId: string) => Task[];
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'status'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  submitTask: (id: string, studentId: string) => Promise<Task | null>;
  approveTask: (id: string, rating: TaskRating) => Promise<Task | null>;
  rejectTask: (id: string) => Promise<Task | null>;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    taskStorage.getAll().then(setTasks);
  }, []);

  const refreshTasks = useCallback(async () => {
    const all = await taskStorage.getAll();
    setTasks(all);
  }, []);

  const getTasksByStudent = useCallback((studentId: string) => {
    // 只返回实例任务（有 taskDate 的），不返回模板
    return tasks.filter(t => t.studentId === studentId && t.taskDate);
  }, [tasks]);

  const getTasksByParent = useCallback((parentId: string) => {
    return tasks.filter(t => t.parentId === parentId);
  }, [tasks]);

  const getTemplatesByParent = useCallback((parentId: string) => {
    return tasks.filter(t => t.parentId === parentId && !t.taskDate && (t.taskType === 'daily' || t.taskType === 'periodic'));
  }, [tasks]);

  const createTask = useCallback(async (data: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const task = await taskStorage.create(data);
    await refreshTasks();
    return task;
  }, [refreshTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const result = await taskStorage.update(id, updates);
    await refreshTasks();
    return result;
  }, [refreshTasks]);

  const deleteTask = useCallback(async (id: string) => {
    const result = await taskStorage.delete(id);
    await refreshTasks();
    return result;
  }, [refreshTasks]);

  const submitTask = useCallback(async (id: string, studentId: string) => {
    const result = await taskStorage.submit(id, studentId);
    await refreshTasks();
    return result;
  }, [refreshTasks]);

  const approveTask = useCallback(async (id: string, rating: TaskRating) => {
    const result = await taskStorage.approve(id, rating);
    await refreshTasks();
    return result;
  }, [refreshTasks]);

  const rejectTask = useCallback(async (id: string) => {
    const result = await taskStorage.reject(id);
    await refreshTasks();
    return result;
  }, [refreshTasks]);

  return (
    <TaskContext.Provider value={{
      tasks, refreshTasks, getTasksByStudent, getTasksByParent, getTemplatesByParent,
      createTask, updateTask, deleteTask, submitTask, approveTask, rejectTask,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks(): TaskContextType {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TaskProvider } from './contexts/TaskContext'
import { LotteryProvider } from './contexts/LotteryContext'
import { MathBossProvider } from './contexts/MathBossContext'
import { PointsProvider } from './contexts/PointsContext'
import { VoucherProvider } from './contexts/VoucherContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LoginRedirect from './pages/LoginRedirect'
import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentTaskPage from './pages/student/StudentTaskPage'
import LotteryPage from './pages/student/LotteryPage'
import MathBossPage from './pages/student/MathBossPage'
import VoucherPage from './pages/student/VoucherPage'
import ParentLayout from './pages/parent/ParentLayout'
import ParentDashboard from './pages/parent/ParentDashboard'
import TaskManagementPage from './pages/parent/TaskManagementPage'
import ApprovalPage from './pages/parent/ApprovalPage'
import LotteryConfigPage from './pages/parent/LotteryConfigPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <LotteryProvider>
            <PointsProvider>
              <MathBossProvider>
                <VoucherProvider>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login-redirect" element={<LoginRedirect />} />

                    <Route
                      path="/student"
                      element={
                        <ProtectedRoute requiredRole="student">
                          <StudentLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="tasks" element={<StudentTaskPage />} />
                      <Route path="lottery" element={<LotteryPage />} />
                      <Route path="math-boss" element={<MathBossPage />} />
                      <Route path="voucher" element={<VoucherPage />} />
                      <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>

                    <Route
                      path="/parent"
                      element={
                        <ProtectedRoute requiredRole="parent">
                          <ParentLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="dashboard" element={<ParentDashboard />} />
                      <Route path="tasks" element={<TaskManagementPage />} />
                      <Route path="approvals" element={<ApprovalPage />} />
                      <Route path="lottery-config" element={<LotteryConfigPage />} />
                      <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </VoucherProvider>
              </MathBossProvider>
            </PointsProvider>
          </LotteryProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'student' | 'parent';
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // 等待认证状态恢复完成
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>🌟</div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>加载中…</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // 角色不匹配，重定向到对应首页
    if (user?.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/parent/dashboard" replace />;
  }

  return <>{children}</>;
}
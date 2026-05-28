import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'student' | 'parent'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await register(username.trim(), password, displayName.trim(), role);
      if (result.success) {
        navigate('/login-redirect');
      } else {
        setError(result.error || '注册失败');
      }
    } catch {
      setError('网络错误，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <span className="login-emoji">🎉</span>
          <h1>注册新账号</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">选择角色</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                <span className="role-emoji">🎒</span>
                <span>学生</span>
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'parent' ? 'active' : ''}`}
                onClick={() => setRole('parent')}
              >
                <span className="role-emoji">👨‍👩‍👧</span>
                <span>家长</span>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">显示昵称</label>
            <input
              className="form-input"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="让大家认识你"
            />
          </div>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="用于登录"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="至少 4 位"
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button className="btn btn-primary btn-lg login-btn" type="submit" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <div className="login-footer">
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  );
}
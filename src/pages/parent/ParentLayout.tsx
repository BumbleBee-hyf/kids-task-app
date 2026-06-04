import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ParentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const navItems = [
    { to: '/parent/dashboard', icon: '🏠', label: '首页' },
    { to: '/parent/tasks', icon: '📝', label: '任务管理' },
    { to: '/parent/approvals', icon: '✅', label: '审批中心' },
    { to: '/parent/lottery-config', icon: '🎰', label: '抽奖配置' },
  ];

  return (
    <div className="layout">
      <nav className="top-navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="brand-icon-small">👨‍👩‍👧</div>
            <div className="brand-text">
              <span className="brand-name">家长中心</span>
              <span className="brand-slogan">陪伴成长 · 见证进步</span>
            </div>
          </div>

          <div className="navbar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.to === '/parent/dashboard'}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="navbar-user user-dropdown">
            <div
              className="navbar-user"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ cursor: 'pointer' }}
            >
              <div className="user-avatar-small">👨‍👩‍👧</div>
              <span className="user-name-small">{user?.displayName}</span>
              <span className="user-dropdown-arrow">▼</span>
            </div>
            {dropdownOpen && (
              <div className="user-dropdown-menu">
                <button className="user-dropdown-item" onClick={handleLogout}>
                  🚪 退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

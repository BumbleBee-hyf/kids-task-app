import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const navItems = [
    { to: '/student/dashboard', icon: '🏠', label: '首页' },
    { to: '/student/tasks', icon: '📋', label: '我的任务' },
    { to: '/student/lottery', icon: '🎰', label: '抽奖中心' },
    { to: '/student/voucher', icon: '💰', label: '我的钱包' },
  ];

  return (
    <div className="layout">
      <nav className="top-navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="brand-icon-small">🎒</div>
            <div className="brand-text">
              <span className="brand-name">学生中心</span>
              <span className="brand-slogan">每日任务 · 快乐成长</span>
            </div>
          </div>

          <div className="navbar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.to === '/student/dashboard'}
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
              <div className="user-avatar-small">👦</div>
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

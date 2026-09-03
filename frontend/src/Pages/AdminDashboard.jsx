import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { logout, user } = useAuth();

  // Updated statistics matching the design
  const stats = useMemo(() => [
    { label: 'Total Users', value: '24,592', trend: '+12.5%', icon: '👥' },
    { label: 'Revenue', value: '$128,430', trend: '+8.2%', icon: '💲' },
    { label: 'Orders', value: '1,284', trend: '+4.1%', icon: '🛒' },
    { label: 'Active Sessions', value: '1,204', trend: '+2.9%', icon: '📈' }
  ], []);

  // New recent users data matching the design
  const recentUsers = useMemo(() => [
    { id: 1, name: 'Jordan Lee', email: 'jordan.lee@company.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Maya Patel', email: 'maya.patel@company.com', role: 'Editor', status: 'Active' },
    { id: 3, name: 'Samir Hassan', email: 'samir.hassan@company.com', role: 'Viewer', status: 'Pending' },
    { id: 4, name: 'Priya Nair', email: 'priya.nair@company.com', role: 'Admin', status: 'Active' },
    { id: 5, name: 'Daniel Kim', email: 'daniel.kim@company.com', role: 'Editor', status: 'Inactive' }
  ], []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'Users') {
      navigate('/register');
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: '⊞' },
    { name: 'Users', icon: '👥' },
    { name: 'Analytics', icon: '📊' },
    { name: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div>
          <div className="brand-header">
            <div className="brand-icon">
              <div className="grid-icon">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
              </div>
            </div>
            <div>
              <h2 className="brand-title">AdminKit</h2>
              <span className="brand-subtitle">Dashboard</span>
            </div>
          </div>

          <nav className="nav-menu">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleTabChange(item.name)}
                className={`nav-button ${activeTab === item.name ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Header Navigation */}
        <header className="dashboard-topbar">
          <h1 className="page-title">Overview</h1>
          
          <div className="topbar-actions">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search users, orders..." className="search-input" />
            </div>
            
            <button className="notification-btn">
              🔔
            </button>

            <div className="user-profile">
              <div className="avatar">
                {user?.lastName ? user.lastName[0] : 'A'}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.firstName || 'Alex'} {user?.lastName || 'Rivera'}</div>
                <div className="user-role">Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          
          {/* Stats Grid */}
          <section className="metrics-grid">
            {stats.map((stat, index) => (
              <div key={index} className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">{stat.label}</span>
                  <span className="metric-icon">{stat.icon}</span>
                </div>
                <div className="metric-value">{stat.value}</div>
                <div className="metric-trend">
                  <span className="trend-up">↗ {stat.trend}</span> vs last month
                </div>
              </div>
            ))}
          </section>

          {/* Recent Users Section */}
          <section className="data-section">
            <div className="data-section-header">
              <div>
                <h2 className="section-title">Recent users</h2>
                <p className="section-subtitle">Manage your team members and their access.</p>
              </div>
              <div className="section-actions">
                <button className="btn-outline">
                  <span>📥</span> Export
                </button>
                <button className="btn-primary">
                  <span>➕</span> Add User
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => {
                    let statusClass = 'status-inactive';
                    if (u.status === 'Active') statusClass = 'status-active';
                    if (u.status === 'Pending') statusClass = 'status-pending';

                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="table-user-cell">
                            <div className="table-avatar">{u.name[0]}</div>
                            <span className="table-user-name">{u.name}</span>
                          </div>
                        </td>
                        <td className="text-gray">{u.email}</td>
                        <td className="text-gray">{u.role}</td>
                        <td>
                          <span className={`status-pill ${statusClass}`}>
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
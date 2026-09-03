import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const rolesConfig = {
  ADMIN: { primary: '#0f172a', accent: '#38bdf8', tag: 'ADMIN' },
  DOCTOR: { primary: '#1d4ed8', accent: '#93c5fd', tag: 'DOCTOR' },
  NURSE: { primary: '#0f766e', accent: '#99f6e4', tag: 'NURSE' },
  PHARMACIST: { primary: '#7c3aed', accent: '#ddd6fe', tag: 'PHARMACIST' },
  RECEPTIONIST: { primary: '#b45309', accent: '#fcd34d', tag: 'RECEPTIONIST' },
  default: { primary: '#374151', accent: '#e5e7eb', tag: 'STAFF' }
};

export default function TestDashboard() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const { logout, user } = useAuth();
  const roleMeta = rolesConfig[user?.role] || rolesConfig.default;

  const overviewCards = useMemo(() => {
    const baseCards = [
      { label: 'Patients Today', value: '128', icon: '🧑‍⚕️', tone: '#2563eb' },
      { label: 'Appointments', value: '34', icon: '📅', tone: '#059669' },
      { label: 'Alerts', value: '06', icon: '⚠️', tone: '#d97706' },
      { label: 'On Duty', value: '12', icon: '✅', tone: '#7c3aed' }
    ];

    if (user?.role === 'DOCTOR') {
      return [
        { label: 'Patient Queue', value: '18', icon: '📋', tone: '#2563eb' },
        { label: 'Prescriptions', value: '26', icon: '💊', tone: '#059669' },
        { label: 'Lab Reports', value: '09', icon: '🧪', tone: '#7c3aed' },
        { label: 'Emergency Cases', value: '03', icon: '🚨', tone: '#dc2626' }
      ];
    }

    if (user?.role === 'NURSE') {
      return [
        { label: 'Ward Visits', value: '42', icon: '🩺', tone: '#2563eb' },
        { label: 'Duties', value: '11', icon: '📝', tone: '#059669' },
        { label: 'Vitals Pending', value: '07', icon: '📊', tone: '#d97706' },
        { label: 'Escalations', value: '02', icon: '🚨', tone: '#dc2626' }
      ];
    }

    if (user?.role === 'ADMIN') {
      return [
        { label: 'Departments', value: '08', icon: '🏥', tone: '#2563eb' },
        { label: 'Staff Online', value: '94', icon: '👥', tone: '#059669' },
        { label: 'System Loads', value: 'Normal', icon: '📈', tone: '#7c3aed' },
        { label: 'Incidents', value: '00', icon: '🛡️', tone: '#1f2937' }
      ];
    }

    return baseCards;
  }, [user?.role]);

  const tasks = useMemo(() => {
    const common = [
      { title: 'Review today’s schedule', time: '09:30 AM', status: 'Pending' },
      { title: 'Check ward handover notes', time: '11:00 AM', status: 'Active' },
      { title: 'Prepare patient discharge summary', time: '01:30 PM', status: 'Pending' }
    ];

    if (user?.role === 'DOCTOR') {
      return [
        { title: 'Review ECG results', time: '10:15 AM', status: 'Priority' },
        { title: 'Follow-up with post-op patients', time: '12:00 PM', status: 'Active' },
        { title: 'Approve prescriptions', time: '03:00 PM', status: 'Pending' }
      ];
    }

    if (user?.role === 'NURSE') {
      return [
        { title: 'Monitor admitted patients', time: '09:00 AM', status: 'Active' },
        { title: 'Update vital observation chart', time: '11:45 AM', status: 'Pending' },
        { title: 'Prepare medication rounds', time: '02:30 PM', status: 'Priority' }
      ];
    }

    return common;
  }, [user?.role]);

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

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'patients', label: 'Patients' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <>
      <style>{`
        /* GLOBAL RESET */
        * {
          margin: 0px;
          padding: 0px;
          box-sizing: border-box;
        }

        body {
          background-color: #f4f5f8;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333333;
        }

        .dashboard-container {
          min-height: 900px;
          background-color: #f4f5f8;
        }

        /* Top Navigation Bar mimicking image */
        .top-navbar {
          background-color: #ffffff;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0px 24px;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.04);
        }

        .top-nav-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hamburger-icon {
          font-size: 20px;
          cursor: pointer;
          color: #6c757d;
        }

        .search-bar {
          background-color: #f0f2f5;
          border-radius: 20px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          width: 300px;
        }

        .search-bar input {
          border: none;
          background: transparent;
          outline: none;
          margin-left: 8px;
          font-size: 14px;
          width: 100%;
        }

        .top-nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-badge {
          border: 1px solid #d1d5db;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background-color: #ffffff;
        }

        .logout-button {
          border: none;
          border-radius: 20px;
          background-color: #e2e8f0;
          color: #475569;
          font-weight: 600;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.2s ease;
        }

        .logout-button:hover {
          background-color: #cbd5e1;
        }

        /* Main Content Wrapper */
        .content-wrapper {
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0px auto;
        }

        /* Sub-Header Area */
        .sub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
        }

        .welcome-text h1 {
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .welcome-text p {
          font-size: 14px;
          color: #64748b;
        }

        .navbar-tabs {
          display: flex;
          gap: 8px;
        }

        .nav-tab {
          border: none;
          background: transparent;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
          color: #64748b;
        }
        
        .nav-tab.active {
          background-color: #e0e7ff;
          color: #4f46e5;
        }

        /* Top Grid layout mimicking tasks & right cards */
        .top-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        /* Left Panel - Task List (Styled like Approvals) */
        .panel-card {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.02);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .panel-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .task-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .task-list-item:last-child {
          border-bottom: none;
          padding-bottom: 0px;
        }

        .task-info-left {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 350px;
        }

        .task-icon-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 24px;
          background-color: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .task-text h4 {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .task-text p {
          font-size: 13px;
          color: #94a3b8;
        }

        .task-time {
          font-size: 13px;
          color: #94a3b8;
          width: 100px;
          text-align: center;
        }

        .task-actions {
          display: flex;
          gap: 8px;
        }

        .status-btn {
          padding: 6px 16px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: default;
        }

        .status-btn.priority { background-color: #fee2e2; color: #dc2626; }
        .status-btn.active { background-color: #dcfce7; color: #16a34a; }
        .status-btn.pending { background-color: #f1f5f9; color: #64748b; }

        /* Right Panel - Quick Actions */
        .right-cards-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .small-stat-card {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.02);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background-color: #e0e7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-info h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }
        
        .stat-info p {
          font-size: 14px;
          color: #94a3b8;
        }

        .quick-action-btn {
          width: 100%;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px;
          border-radius: 6px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
          cursor: pointer;
        }

        /* Notice Box */
        .notice-box {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }

        .notice-title {
          font-size: 13px;
          font-weight: 700;
          color: #166534;
          margin-bottom: 4px;
        }

        .notice-text {
          font-size: 12px;
          color: #14532d;
          line-height: 18px;
        }

        /* Bottom Grid - Metrics (Styled like Social Cards) */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .metric-card-social {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
        }

        .metric-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .metric-icon-large {
          font-size: 28px;
        }

        .metric-value-container {
          text-align: right;
        }

        .metric-value-container h3 {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
        }

        .metric-value-container span {
          font-size: 13px;
          font-weight: 600;
        }

        .metric-bottom-row {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #f1f5f9;
          padding-top: 16px;
        }

        .metric-sub-item {
          text-align: center;
          width: 50%;
        }
        
        .metric-sub-item:first-child {
          border-right: 1px solid #f1f5f9;
        }

        .metric-sub-label {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .metric-sub-value {
          font-size: 15px;
          font-weight: 700;
          color: #334155;
        }
      `}</style>

      <div className="dashboard-container">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="top-nav-left">
            <div className="hamburger-icon">☰</div>
            <div className="search-bar">
              <span>🔍</span>
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          <div className="top-nav-right">
            <div className="header-actions">
              <div 
                className="status-badge" 
                style={{ borderColor: roleMeta.accent, color: roleMeta.primary }}
              >
                Secure session active
              </div>
              <button 
                onClick={handleLogout} 
                disabled={isLoggingOut} 
                className="logout-button"
              >
                {isLoggingOut ? 'Logging out...' : 'Secure Logout'}
              </button>
            </div>
          </div>
        </header>

        <main className="content-wrapper">
          {/* Sub Header & Navigation */}
          <div className="sub-header">
            <div className="welcome-text">
              <p>HMS / Staff Portal</p>
              <h1>Welcome back, {user?.firstName} {user?.lastName}</h1>
              <p>{user?.department} • <span style={{ color: roleMeta.primary, fontWeight: 600 }}>{roleMeta.tag}</span></p>
            </div>
            
            <nav className="navbar-tabs">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`nav-tab ${activeView === item.id ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Top Layout Grid */}
          <div className="top-grid">
            {/* Left Panel: Tasks List (Approvals Style) */}
            <section className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Today’s Priorities</h2>
              </div>
              <div className="task-list">
                {tasks.map((task, index) => (
                  <div key={index} className="task-list-item">
                    <div className="task-info-left">
                      <div className="task-icon-placeholder">📋</div>
                      <div className="task-text">
                        <h4>{task.title}</h4>
                        <p>HMS internal tracking protocol...</p>
                      </div>
                    </div>
                    <div className="task-time">{task.time}</div>
                    <div className="task-actions">
                      <span className={`status-btn ${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Right Panel: Quick Actions & Stats */}
            <aside className="right-cards-container">
              <div className="small-stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-info">
                  <h2>Actions</h2>
                  <p>Quick System Shortcuts</p>
                </div>
              </div>
              
              <div className="panel-card" style={{ padding: '20px' }}>
                <button className="quick-action-btn">🩺 Patient Records</button>
                <button className="quick-action-btn">📋 Schedule Review</button>
                <button className="quick-action-btn">💊 Medication Queue</button>
                <button className="quick-action-btn">🧪 Lab Results</button>
                
                <div className="notice-box">
                  <div className="notice-title">Security notice</div>
                  <div className="notice-text">
                    Your session is protected with secure token validation and role-based access checks.
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom Grid: Metrics Cards (Social Stats Style) */}
          <section className="metrics-grid">
            {overviewCards.map((card, index) => (
              <div key={index} className="metric-card-social">
                <div className="metric-top-row">
                  <div className="metric-icon-large" style={{ color: card.tone }}>
                    {card.icon}
                  </div>
                  <div className="metric-value-container">
                    <h3>{card.value}</h3>
                    <span style={{ color: card.tone }}>Live Status Update</span>
                  </div>
                </div>
                <div className="metric-bottom-row">
                  <div className="metric-sub-item">
                    <div className="metric-sub-label">Category</div>
                    <div className="metric-sub-value">{card.label}</div>
                  </div>
                  <div className="metric-sub-item">
                    <div className="metric-sub-label">Priority</div>
                    <div className="metric-sub-value">Normal</div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}
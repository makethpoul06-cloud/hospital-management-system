import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const rolesConfig = {
  ADMIN: {
    primary: '#0f172a',
    accent: '#38bdf8',
    tag: 'ADMIN'
  },
  DOCTOR: {
    primary: '#1d4ed8',
    accent: '#93c5fd',
    tag: 'DOCTOR'
  },
  NURSE: {
    primary: '#0f766e',
    accent: '#99f6e4',
    tag: 'NURSE'
  },
  PHARMACIST: {
    primary: '#7c3aed',
    accent: '#ddd6fe',
    tag: 'PHARMACIST'
  },
  RECEPTIONIST: {
    primary: '#b45309',
    accent: '#fcd34d',
    tag: 'RECEPTIONIST'
  },
  default: {
    primary: '#374151',
    accent: '#e5e7eb',
    tag: 'STAFF'
  }
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

    if (user.role === 'DOCTOR') {
      return [
        { label: 'Patient Queue', value: '18', icon: '📋', tone: '#2563eb' },
        { label: 'Prescriptions', value: '26', icon: '💊', tone: '#059669' },
        { label: 'Lab Reports', value: '09', icon: '🧪', tone: '#7c3aed' },
        { label: 'Emergency Cases', value: '03', icon: '🚨', tone: '#dc2626' }
      ];
    }

    if (user.role === 'NURSE') {
      return [
        { label: 'Ward Visits', value: '42', icon: '🩺', tone: '#2563eb' },
        { label: 'Duties', value: '11', icon: '📝', tone: '#059669' },
        { label: 'Vitals Pending', value: '07', icon: '📊', tone: '#d97706' },
        { label: 'Escalations', value: '02', icon: '🚨', tone: '#dc2626' }
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        { label: 'Departments', value: '08', icon: '🏥', tone: '#2563eb' },
        { label: 'Staff Online', value: '94', icon: '👥', tone: '#059669' },
        { label: 'System Loads', value: 'Normal', icon: '📈', tone: '#7c3aed' },
        { label: 'Incidents', value: '00', icon: '🛡️', tone: '#1f2937' }
      ];
    }

    return baseCards;
  }, [user.role]);

  const tasks = useMemo(() => {
    const common = [
      { title: 'Review today’s schedule', time: '09:30 AM', status: 'Pending' },
      { title: 'Check ward handover notes', time: '11:00 AM', status: 'Active' },
      { title: 'Prepare patient discharge summary', time: '01:30 PM', status: 'Pending' }
    ];

    if (user.role === 'DOCTOR') {
      return [
        { title: 'Review ECG results', time: '10:15 AM', status: 'Priority' },
        { title: 'Follow-up with post-op patients', time: '12:00 PM', status: 'Active' },
        { title: 'Approve prescriptions', time: '03:00 PM', status: 'Pending' }
      ];
    }

    if (user.role === 'NURSE') {
      return [
        { title: 'Monitor admitted patients', time: '09:00 AM', status: 'Active' },
        { title: 'Update vital observation chart', time: '11:45 AM', status: 'Pending' },
        { title: 'Prepare medication rounds', time: '02:30 PM', status: 'Priority' }
      ];
    }

    return common;
  }, [user.role]);

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
    <div style={styles.pageShell}>
      <div style={styles.backgroundGlow} />

      <div style={styles.dashboardWrap}>
        <header style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>HMS / Staff Portal</div>
            <h1 style={styles.title}>Welcome back, {user.firstName} {user.lastName}</h1>
            <p style={styles.subtitle}>
              {user.department} • <span style={{ color: roleMeta.primary }}>{roleMeta.tag}</span>
            </p>
          </div>

          <div style={styles.headerActions}>
            <div style={{ ...styles.statusBadge, borderColor: roleMeta.accent, color: roleMeta.primary }}>
              Secure session active
            </div>
            <button onClick={handleLogout} disabled={isLoggingOut} style={styles.logoutButton}>
              {isLoggingOut ? 'Logging out...' : 'Secure Logout'}
            </button>
          </div>
        </header>

        <nav style={styles.navbar}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                ...styles.navButton,
                background: activeView === item.id ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                color: activeView === item.id ? '#1d4ed8' : '#475569'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section style={styles.metricsGrid}>
          {overviewCards.map((card) => (
            <div key={card.label} style={{ ...styles.metricCard, borderTop: `4px solid ${card.tone}` }}>
              <div style={styles.metricIcon}>{card.icon}</div>
              <div>
                <div style={styles.metricLabel}>{card.label}</div>
                <div style={styles.metricValue}>{card.value}</div>
              </div>
            </div>
          ))}
        </section>

        <main style={styles.contentGrid}>
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Today’s priorities</h2>
              <span style={styles.panelPill}>Live</span>
            </div>

            <div style={styles.taskList}>
              {tasks.map((task) => (
                <div key={task.title} style={styles.taskItem}>
                  <div>
                    <div style={styles.taskTitle}>{task.title}</div>
                    <div style={styles.taskTime}>{task.time}</div>
                  </div>
                  <span
                    style={{
                      ...styles.taskStatus,
                      background: task.status === 'Priority' ? '#fee2e2' : task.status === 'Active' ? '#dcfce7' : '#e0f2fe',
                      color: task.status === 'Priority' ? '#b91c1c' : task.status === 'Active' ? '#166534' : '#0f766e'
                    }}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <aside style={styles.sidePanel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Quick actions</h2>
            </div>

            <div style={styles.quickActions}>
              <button style={styles.actionButton}>🩺 Patient Records</button>
              <button style={styles.actionButton}>📋 Schedule Review</button>
              <button style={styles.actionButton}>💊 Medication Queue</button>
              <button style={styles.actionButton}>🧪 Lab Results</button>
            </div>

            <div style={styles.noticeBox}>
              <div style={styles.noticeTitle}>Security notice</div>
              <div style={styles.noticeText}>
                Your session is protected with secure token validation and role-based access checks.
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

const styles = {
  pageShell: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
    padding: '32px 20px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    color: '#0f172a',
    position: 'relative',
    overflow: 'hidden'
  },
  backgroundGlow: {
    position: 'absolute',
    inset: '0 auto auto 0',
    width: '420px',
    height: '420px',
    background: 'radial-gradient(circle, rgba(96,165,250,0.2), transparent 70%)',
    pointerEvents: 'none'
  },
  dashboardWrap: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1280px',
    margin: '0 auto',
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '24px',
    boxShadow: '0 25px 60px rgba(15, 23, 42, 0.12)',
    backdropFilter: 'blur(10px)',
    padding: '28px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '22px',
    marginBottom: '22px',
    flexWrap: 'wrap'
  },
  breadcrumb: {
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#64748b',
    marginBottom: '8px'
  },
  title: {
    margin: 0,
    fontSize: 'clamp(1.8rem, 2vw, 2.6rem)',
    lineHeight: 1.2,
    color: '#0f172a'
  },
  subtitle: {
    margin: '8px 0 0',
    color: '#475569',
    fontSize: '15px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  statusBadge: {
    border: '1px solid',
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.8)',
    fontSize: '12px',
    fontWeight: 600
  },
  logoutButton: {
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    fontWeight: 700,
    padding: '12px 18px',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.25)',
    transition: 'transform 0.2s ease'
  },
  navbar: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '26px'
  },
  navButton: {
    border: '1px solid #dbeafe',
    borderRadius: '10px',
    padding: '10px 16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
    marginBottom: '26px'
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    padding: '18px 20px',
    boxShadow: '0 12px 25px rgba(15, 23, 42, 0.04)'
  },
  metricIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'grid',
    placeItems: 'center',
    fontSize: '24px',
    background: 'rgba(239,246,255,0.9)'
  },
  metricLabel: {
    color: '#64748b',
    fontSize: '12px',
    marginBottom: '4px'
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 0.9fr',
    gap: '24px'
  },
  panel: {
    background: '#fff',
    borderRadius: '22px',
    padding: '22px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)'
  },
  sidePanel: {
    background: '#fff',
    borderRadius: '22px',
    padding: '22px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px'
  },
  panelTitle: {
    margin: 0,
    fontSize: '1.2rem',
    color: '#0f172a'
  },
  panelPill: {
    background: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: 700
  },
  taskList: {
    display: 'grid',
    gap: '12px'
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: '14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  taskTitle: {
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '4px'
  },
  taskTime: {
    fontSize: '12px',
    color: '#64748b'
  },
  taskStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap'
  },
  quickActions: {
    display: 'grid',
    gap: '12px'
  },
  actionButton: {
    width: '100%',
    border: '1px solid #dbeafe',
    background: '#f8fbff',
    color: '#1e293b',
    borderRadius: '12px',
    padding: '12px 14px',
    textAlign: 'left',
    fontWeight: 600,
    cursor: 'pointer'
  },
  noticeBox: {
    marginTop: '20px',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
    border: '1px solid #bbf7d0',
    borderRadius: '14px',
    padding: '14px',
    color: '#14532d'
  },
  noticeTitle: {
    fontWeight: 800,
    marginBottom: '6px'
  },
  noticeText: {
    lineHeight: 1.6,
    fontSize: '13px'
  }
};
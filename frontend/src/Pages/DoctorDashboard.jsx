import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, user } = useAuth();

  const stats = useMemo(() => [
    { label: 'Patients in queue', value: '18', icon: '🧑‍⚕️', color: '#2563eb' },
    { label: 'Appointments today', value: '34', icon: '📅', color: '#059669' },
    { label: 'Lab reports', value: '09', icon: '🧪', color: '#7c3aed' },
    { label: 'Urgent follow-ups', value: '03', icon: '🚨', color: '#dc2626' }
  ], []);

  const tasks = useMemo(() => [
    { title: 'Review ECG results', time: '10:15 AM', status: 'Priority' },
    { title: 'Approve new prescriptions', time: '12:00 PM', status: 'Active' },
    { title: 'Consult post-op recovery list', time: '02:30 PM', status: 'Pending' },
    { title: 'Round check with cardiology team', time: '04:00 PM', status: 'Scheduled' }
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

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>HMS / Medical Team</div>
            <h1 style={styles.title}>Dr. {user.lastName}</h1>
            <p style={styles.subtitle}>{user.department} Department</p>
          </div>
          <button style={styles.logoutButton} onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out...' : 'Secure Logout'}
          </button>
        </header>

        <section style={styles.grid}>
          {stats.map((item) => (
            <div key={item.label} style={{ ...styles.card, borderTop: `4px solid ${item.color}` }}>
              <div style={{ ...styles.icon, background: `${item.color}18` }}>{item.icon}</div>
              <div>
                <div style={styles.label}>{item.label}</div>
                <div style={styles.value}>{item.value}</div>
              </div>
            </div>
          ))}
        </section>

        <main style={styles.mainGrid}>
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Today’s clinical priorities</h2>
              <span style={styles.pill}>Live</span>
            </div>

            {tasks.map((task) => (
              <div key={task.title} style={styles.taskRow}>
                <div>
                  <div style={styles.taskTitle}>{task.title}</div>
                  <div style={styles.taskTime}>{task.time}</div>
                </div>
                <span
                  style={{
                    ...styles.status,
                    background:
                      task.status === 'Priority'
                        ? '#fee2e2'
                        : task.status === 'Active'
                          ? '#dcfce7'
                          : task.status === 'Scheduled'
                            ? '#e0f2fe'
                            : '#f3f4f6',
                    color:
                      task.status === 'Priority'
                        ? '#b91c1c'
                        : task.status === 'Active'
                          ? '#166534'
                          : task.status === 'Scheduled'
                            ? '#0f766e'
                            : '#475569'
                  }}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </section>

          <aside style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Quick actions</h2>
            </div>
            <div style={styles.actionList}>
              <button style={styles.actionBtn}>🩺 View patients</button>
              <button style={styles.actionBtn}>💊 Prescriptions</button>
              <button style={styles.actionBtn}>🧪 Lab reports</button>
              <button style={styles.actionBtn}>📄 Discharge notes</button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
    padding: '32px 20px',
    fontFamily: 'Segoe UI, sans-serif'
  },
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: '24px',
    boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
    padding: '28px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '20px',
    marginBottom: '22px',
    flexWrap: 'wrap'
  },
  eyebrow: {
    fontSize: '12px',
    color: '#64748b',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  title: {
    margin: 0,
    fontSize: '2.1rem',
    color: '#0f172a'
  },
  subtitle: {
    margin: '8px 0 0',
    color: '#475569',
    fontSize: '15px'
  },
  logoutButton: {
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    padding: '12px 18px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
    marginBottom: '24px'
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    padding: '18px 20px'
  },
  icon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'grid',
    placeItems: 'center',
    fontSize: '24px'
  },
  label: {
    color: '#64748b',
    fontSize: '12px',
    marginBottom: '6px'
  },
  value: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 0.9fr',
    gap: '20px'
  },
  panel: {
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '22px',
    boxShadow: '0 12px 24px rgba(15,23,42,0.04)'
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
  pill: {
    background: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: 700
  },
  taskRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 0',
    borderBottom: '1px solid #f1f5f9'
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
  status: {
    borderRadius: '999px',
    padding: '7px 10px',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap'
  },
  actionList: {
    display: 'grid',
    gap: '12px'
  },
  actionBtn: {
    width: '100%',
    border: '1px solid #dbeafe',
    background: '#f8fbff',
    borderRadius: '12px',
    padding: '12px 14px',
    textAlign: 'left',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#1e293b'
  }
};

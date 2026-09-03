import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, error } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!email.trim()) {
      setErrorMessage('Email is required');
      return;
    }
    if (!password) {
      setErrorMessage('Password is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // Redirect based on role
        const role = result.user?.role;
        if (role === 'DOCTOR') {
          navigate('/dashboard/doctor', { replace: true });
        } else if (role === 'NURSE') {
          navigate('/dashboard/nurse', { replace: true });
        } else if (role === 'ADMIN') {
          navigate('/dashboard/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setErrorMessage(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logo}>🏥</div>
            <h1 style={styles.title}>HMS Login</h1>
            <p style={styles.subtitle}>Hospital Management System</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}
            {error && <div style={styles.errorAlert}>{error}</div>}

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@hospital.local"
                style={styles.input}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <div style={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  style={styles.input}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.toggleBtn}
                  disabled={isSubmitting}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>Demo Credentials:</p>
            <code style={styles.credentialBox}>
              doctor@hms.local / SecurePass123!
            </code>
            <code style={styles.credentialBox}>
              nurse@hms.local / SecurePass123!
            </code>
            <code style={styles.credentialBox}>
              admin@hms.local / SecurePass123!
            </code>
          </div>

          <div style={styles.security}>
            <span style={styles.securityIcon}>🔒</span>
            <span style={styles.securityText}>End-to-end encrypted connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Segoe UI, sans-serif'
  },
  container: {
    width: '100%',
    maxWidth: '420px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '40px 32px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logo: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    color: '#1e293b',
    fontWeight: 700
  },
  subtitle: {
    margin: '0',
    color: '#64748b',
    fontSize: '14px'
  },
  form: {
    marginBottom: '24px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#1e293b',
    fontWeight: 600,
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  toggleBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px'
  },
  submitBtn: {
    width: '100%',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '8px'
  },
  errorAlert: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px 14px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid #fecaca'
  },
  footer: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px',
    marginBottom: '20px'
  },
  footerText: {
    margin: '0 0 12px',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  credentialBox: {
    display: 'block',
    background: '#f1f5f9',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#1e293b',
    marginBottom: '8px',
    fontFamily: 'Courier New, monospace',
    border: '1px solid #cbd5e1'
  },
  security: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  securityIcon: {
    fontSize: '16px'
  },
  securityText: {
    fontWeight: 500
  }
};

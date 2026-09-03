import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validate inputs
    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setLocalError('Password must include uppercase, lowercase, number, and symbol');
      return;
    }

    try {
      const result = await login(email.trim().toLowerCase(), password);
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
        setLocalError(result.error || 'Authentication failed. Invalid credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏥</div>
          <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
            HMS Staff Portal
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Authorized Medical & Administrative Personnel Only
          </p>
        </div>

        {(error || localError) && (
          <div style={errorBannerStyle} role="alert" aria-live="assertive">
            <span style={{ marginRight: '8px' }}>⚠️</span>
            {error || localError}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="email" style={labelStyle}>
              Staff Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              style={inputStyle}
              aria-label="Email address"
            />
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>
              Secure Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                minLength={8}
                title="Use at least 8 characters with uppercase, lowercase, number, and symbol"
                style={inputStyle}
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  opacity: isLoading ? 0.5 : 1
                }}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: isLoading ? '#94a3b8' : '#2563eb',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.8 : 1,
              transition: 'all 0.2s ease'
            }}
            aria-busy={isLoading}
          >
            {isLoading ? '🔐 Authenticating...' : '🔒 Secure Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Need to provision a staff account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Open Admin Register
            </button>
          </p>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #dcfce7' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#166534', fontWeight: '500' }}>
            🔐 Secure Connection Verified • End-to-End Encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const cardStyle = {
  width: '100%',
  maxWidth: '400px',
  padding: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  border: '1px solid #e2e8f0',
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#334155',
  textAlign: 'left',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  paddingRight: '40px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
  fontSize: '14px',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '14px',
  marginTop: '8px',
};

const errorBannerStyle = {
  backgroundColor: '#fef2f2',
  color: '#dc2626',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '14px',
  marginBottom: '16px',
  border: '1px solid #fecaca',
  textAlign: 'center',
};
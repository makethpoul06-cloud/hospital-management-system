import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'Segoe UI, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'spin 1s linear infinite'
            }}
          >
            ⏳
          </div>
          <h2>Loading secure session...</h2>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          fontFamily: 'Segoe UI, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔐</div>
          <h1>Access Denied</h1>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>
            Your role ({user?.role}) does not have access to this resource.
          </p>
          <p style={{ fontSize: '14px', opacity: 0.7 }}>Required roles: {allowedRoles.join(', ')}</p>
        </div>
      </div>
    );
  }

  return children;
}

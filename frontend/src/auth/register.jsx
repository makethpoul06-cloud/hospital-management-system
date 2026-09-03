import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'NURSE',
  department: '',
  temporaryPassword: ''
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ROLE_OPTIONS = [
  'DOCTOR',
  'NURSE',
  'PHARMACIST',
  'LAB_TECH',
  'RECEPTIONIST',
  'BILLING',
  'ADMIN'
];

function formatRole(role) {
  return role
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function generateStrongPassword(length = 16) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = upper + lower + numbers + symbols;

  let password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  for (let i = password.length; i < length; i += 1) {
    password.push(all[Math.floor(Math.random() * all.length)]);
  }

  return password.sort(() => Math.random() - 0.5).join('');
}

function validateForm(formData) {
  const firstName = formData.firstName.trim();
  const lastName = formData.lastName.trim();
  const email = formData.email.trim().toLowerCase();
  const department = formData.department.trim();
  const password = formData.temporaryPassword.trim();

  if (!firstName || !lastName) {
    return 'First name and last name are required.';
  }

  if (firstName.length < 2 || lastName.length < 2) {
    return 'Names must be at least 2 characters long.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'A valid hospital email is required.';
  }

  if (!ROLE_OPTIONS.includes(formData.role)) {
    return 'Select a valid staff role.';
  }

  if (!department || department.length < 2) {
    return 'Department is required.';
  }

  if (password.length < 8) {
    return 'Temporary password must be at least 8 characters long.';
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
    return 'Password must include uppercase, lowercase, number, and symbol.';
  }

  return '';
}

export default function AdminProvisionStaff() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleRoleChange = (event) => {
    setFormData((prev) => ({ ...prev, role: event.target.value }));
    setError('');
    setSuccess('');
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword();
    setFormData((prev) => ({ ...prev, temporaryPassword: generated }));
    setSuccess('A secure temporary password has been generated for this staff member.');
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationMessage = validateForm(formData);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const accessToken = localStorage.getItem('hms_access_token');
    if (!accessToken) {
      setError('Your admin session has expired. Please log in again.');
      navigate('/login', { replace: true });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          department: formData.department.trim(),
          password: formData.temporaryPassword.trim()
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Unable to provision staff account.');
      }

      setSuccess(
        `Account created for ${formData.firstName.trim()} ${formData.lastName.trim()}. ` +
          `Temporary password: ${formData.temporaryPassword.trim()} ` +
          `They must change it after the first login.`
      );
      setFormData(DEFAULT_FORM);
      setShowPassword(false);
    } catch (registerError) {
      console.error('Provisioning error:', registerError);
      setError(registerError.message || 'Unable to reach the secure hospital network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#1d4ed8' }}>Provision New Staff</h2>
          <p style={{ margin: 0, color: '#2563eb', fontSize: '14px' }}>
            Create a secure hospital account for new staff. Admin access required.
          </p>
        </div>

        {error && <div style={errorBannerStyle} role="alert">{error}</div>}
        {success && <div style={successBannerStyle} role="alert">{success}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label htmlFor="firstName" style={labelStyle}>First Name</label>
              <input className="registration-control" id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={isLoading} style={inputStyle} autoComplete="given-name" />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label htmlFor="lastName" style={labelStyle}>Last Name</label>
              <input className="registration-control" id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleChange} required disabled={isLoading} style={inputStyle} autoComplete="family-name" />
            </div>
          </div>

          <div>
            <label htmlFor="email" style={labelStyle}>Hospital Email</label>
            <input className="registration-control" id="email" type="email" name="email" placeholder="staff@hospital.com" value={formData.email} onChange={handleChange} required disabled={isLoading} style={inputStyle} autoComplete="email" />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label htmlFor="role" style={labelStyle}>Clinical Role</label>
              <select className="registration-control" id="role" name="role" value={formData.role} onChange={handleRoleChange} disabled={isLoading} required style={{ ...inputStyle, colorScheme: 'light' }}>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{formatRole(option)}</option>
                ))}
              </select>
              <div style={{ marginTop: '5px', color: '#2563eb', fontSize: '12px' }}>
                Selected role: {formatRole(formData.role)}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label htmlFor="department" style={labelStyle}>Department</label>
              <input className="registration-control" id="department" type="text" name="department" placeholder="e.g., Cardiology" value={formData.department} onChange={handleChange} required disabled={isLoading} style={inputStyle} autoComplete="organization" />
            </div>
          </div>

          <div>
            <label htmlFor="temporaryPassword" style={labelStyle}>Temporary Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="registration-control"
                id="temporaryPassword"
                type={showPassword ? 'text' : 'password'}
                name="temporaryPassword"
                placeholder="Generate or type a secure temporary password"
                value={formData.temporaryPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                style={{ ...inputStyle, paddingRight: '110px' }}
                aria-label="Temporary password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                style={togglePasswordStyle}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Must change on first login.</span>
              <button type="button" onClick={handleGeneratePassword} disabled={isLoading} style={secondaryButtonStyle}>
                Generate Secure Password
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: isLoading ? '#94a3b8' : '#10b981',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Creating Account...' : 'Provision Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={() => navigate('/login', { replace: true })} style={linkButtonStyle}>
            Return to Login
          </button>
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
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  padding: '20px'
};

const cardStyle = {
  width: '100%',
  maxWidth: '560px',
  padding: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '14px',
  boxShadow: '0 12px 35px rgba(15, 23, 42, 0.10)',
  border: '1px solid #e2e8f0'
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#1d4ed8',
  textAlign: 'left'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
  fontSize: '14px',
  backgroundColor: '#fff',
  color: '#0f3b82',
  caretColor: '#2563eb',
  outline: '2px solid transparent',
  outlineOffset: '1px',
  cursor: 'text',
  WebkitTextFillColor: '#0f3b82'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  color: '#ffffff',
  backgroundColor: '#2563eb',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '700',
  fontSize: '14px',
  marginTop: '8px'
};

const togglePasswordStyle = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  color: '#1d4ed8',
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '12px',
  cursor: 'pointer'
};

const secondaryButtonStyle = {
  border: '1px solid #2563eb',
  background: '#eff6ff',
  color: '#1d4ed8',
  padding: '7px 10px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600'
};

const errorBannerStyle = {
  backgroundColor: '#fef2f2',
  color: '#dc2626',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '16px',
  border: '1px solid #fecaca'
};

const successBannerStyle = {
  backgroundColor: '#f0fdf4',
  color: '#15803d',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '16px',
  border: '1px solid #bbf7d0'
};

const linkButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#1d4ed8',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
};
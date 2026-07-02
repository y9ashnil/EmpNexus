import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { Shield, Users, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAppState();
  const [role, setRole] = useState('admin'); // 'admin', 'hr', or 'employee'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const res = await login(email, password, role);
    if (!res.success) {
      setError(res.message);
    }
  };

  const autofill = (type) => {
    if (type === 'admin') {
      setEmail('admin@ems.com');
      setPassword('admin123');
      setRole('admin');
    } else if (type === 'hr') {
      setEmail('hr@ems.com');
      setPassword('hr123');
      setRole('hr');
    } else {
      setEmail('sarah@ems.com');
      setPassword('password123');
      setRole('employee');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          {/* Animated Ambient SVG Logo */}
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.2)', marginBottom: '16px' }}>
            <Shield size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '4px' }}>EmpNexus</h2>
          <p style={{ fontSize: '0.875rem' }}>Employee Management System</p>
        </div>

        <div className="login-tabs">
          <div 
            className={`login-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => { setRole('admin'); setError(''); }}
          >
            <Shield size={13} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
            Admin
          </div>
          <div 
            className={`login-tab ${role === 'hr' ? 'active' : ''}`}
            onClick={() => { setRole('hr'); setError(''); }}
          >
            <Users size={13} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
            HR
          </div>
          <div 
            className={`login-tab ${role === 'employee' ? 'active' : ''}`}
            onClick={() => { setRole('employee'); setError(''); }}
          >
            <User size={13} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
            Employee
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={16} />
              </span>
              <input 
                type="email" 
                className="form-input" 
                placeholder={role === 'admin' ? 'admin@ems.com' : role === 'hr' ? 'hr@ems.com' : 'employee@ems.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </span>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                required 
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
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '46px' }}>
            Access Dashboard <ArrowRight size={16} />
          </button>
        </form>

        <div className="login-footer-info">
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>Demo Accounts (Quick-fill):</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              onClick={() => autofill('admin')}
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '4px 6px', fontSize: '0.6875rem' }}
            >
              Admin
            </button>
            <button 
              type="button" 
              onClick={() => autofill('hr')}
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '4px 6px', fontSize: '0.6875rem' }}
            >
              HR
            </button>
            <button 
              type="button" 
              onClick={() => autofill('employee')}
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '4px 6px', fontSize: '0.6875rem' }}
            >
              Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

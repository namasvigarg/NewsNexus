import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LoginProps {
  onSwitchToLogin?: () => void;
  onSwitchToSignup: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'forgotEmail' | null>(null);
  
  // Views: 'login' | 'forgot'
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials.');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotEmail) {
      setError('Please enter your email address.');
      return;
    }

    // Check if user exists in local storage
    const users = JSON.parse(localStorage.getItem('newsNexusUsers') || '[]');
    const foundUser = users.find((u: any) => u.email === forgotEmail);

    if (foundUser) {
      setSuccess(`Simulation: Password reset email sent. (Developer note: your password is "${foundUser.password}")`);
    } else {
      setError('No account found with this email address.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Animated Shapes in Background */}
      <div className="interactive-bg">
        <div className="circle-shape circle-1"></div>
        <div className="circle-shape circle-2"></div>
        <div className="circle-shape circle-3"></div>
      </div>

      <div 
        className="glass-panel animate-fade-in-up" 
        style={{
          borderRadius: '24px',
          padding: '48px 40px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: isDark 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)' 
            : '0 25px 50px -12px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          zIndex: 1
        }}
      >
        {view === 'login' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: '800',
                marginBottom: '12px',
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <span>📰</span>
                <span className="gradient-text">NewsNexus</span>
              </h1>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                Welcome back! Let's personalize your news.
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '20px',
                animation: 'fadeIn 0.3s'
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--text-secondary)'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: focusedField === 'email' 
                      ? '1px solid var(--accent-purple)' 
                      : '1px solid var(--border-color)',
                    fontSize: '15px',
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxShadow: focusedField === 'email' 
                      ? '0 0 0 4px rgba(124, 58, 237, 0.15)' 
                      : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{
                    fontWeight: '600',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--text-secondary)'
                  }}>
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: focusedField === 'password' 
                      ? '1px solid var(--accent-purple)' 
                      : '1px solid var(--border-color)',
                    fontSize: '15px',
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxShadow: focusedField === 'password' 
                      ? '0 0 0 4px rgba(124, 58, 237, 0.15)' 
                      : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot');
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-purple)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--gradient-accent)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(124, 58, 237, 0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                }}
              >
                {loading ? 'Verifying details...' : 'Sign In'}
              </button>
            </form>

            <div style={{ 
              marginTop: '32px', 
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              New to NewsNexus?{' '}
              <button
                onClick={onSwitchToSignup}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-purple)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  padding: '0 2px'
                }}
              >
                Create an account
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '800',
                marginBottom: '10px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)'
              }}>
                Retrieve Password
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '500',
                lineHeight: '1.5'
              }}>
                Enter the email address of your account to retrieve your password.
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '20px',
                animation: 'fadeIn 0.3s'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Success Message Box */}
            {success && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '20px',
                animation: 'fadeIn 0.3s',
                lineHeight: '1.5'
              }}>
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--text-secondary)'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  onFocus={() => setFocusedField('forgotEmail')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: focusedField === 'forgotEmail' 
                      ? '1px solid var(--accent-purple)' 
                      : '1px solid var(--border-color)',
                    fontSize: '15px',
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxShadow: focusedField === 'forgotEmail' 
                      ? '0 0 0 4px rgba(124, 58, 237, 0.15)' 
                      : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--gradient-accent)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  marginBottom: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(124, 58, 237, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                }}
              >
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setError('');
                  setSuccess('');
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Back to Sign In
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
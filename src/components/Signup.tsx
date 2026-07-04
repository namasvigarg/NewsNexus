import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SignupProps {
  onSwitchToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | 'confirm' | null>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signup } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await signup(email, password, name);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Signup failed.');
    } else {
      setSuccess('Account created! Please check your email inbox to confirm your registration.');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
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
          padding: '40px 40px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: isDark 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)' 
            : '0 25px 50px -12px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '800',
            marginBottom: '10px',
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
            Join us to curate your personalized news feed.
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
            animation: 'fadeIn 0.3s'
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-secondary)'
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="Alex Morgan"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: focusedField === 'name' 
                  ? '1px solid var(--accent-purple)' 
                  : '1px solid var(--border-color)',
                fontSize: '14px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxShadow: focusedField === 'name' 
                  ? '0 0 0 4px rgba(124, 58, 237, 0.15)' 
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
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
              placeholder="alex@example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: focusedField === 'email' 
                  ? '1px solid var(--accent-purple)' 
                  : '1px solid var(--border-color)',
                fontSize: '14px',
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

          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-secondary)'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="At least 6 characters"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: focusedField === 'password' 
                  ? '1px solid var(--accent-purple)' 
                  : '1px solid var(--border-color)',
                fontSize: '14px',
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

          <div style={{ marginBottom: '26px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-secondary)'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              placeholder="Confirm your password"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: focusedField === 'confirm' 
                  ? '1px solid var(--accent-purple)' 
                  : '1px solid var(--border-color)',
                fontSize: '14px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxShadow: focusedField === 'confirm' 
                  ? '0 0 0 4px rgba(124, 58, 237, 0.15)' 
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ 
          marginTop: '28px', 
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
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
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};
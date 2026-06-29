import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const isDark = theme === 'dark';

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          padding: '10px 18px',
          borderRadius: '9999px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--glass-bg)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: 'var(--shadow-sm)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-purple)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span>👤</span>
        <span>{user.name}</span>
        <span style={{ fontSize: '10px', marginLeft: '2px', opacity: 0.7 }}>{showMenu ? '▲' : '▼'}</span>
      </button>

      {showMenu && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setShowMenu(false)}
          />
          <div 
            className="glass-panel animate-fade-in"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '12px',
              borderRadius: '16px',
              boxShadow: isDark 
                ? '0 10px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' 
                : '0 10px 30px rgba(79, 70, 229, 0.1)',
              padding: '10px',
              minWidth: '220px',
              zIndex: 1000
            }}
          >
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '6px'
            }}>
              <div style={{ 
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '2px',
                fontSize: '14px',
                fontFamily: 'var(--font-heading)'
              }}>
                {user.name}
              </div>
              <div style={{ 
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                {user.email}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setShowMenu(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};
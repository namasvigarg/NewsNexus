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
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s'
        }}
      >
        <span>👤</span>
        <span>{user.name}</span>
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
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: isDark ? '#1e293b' : 'white',
            borderRadius: '12px',
            boxShadow: isDark 
              ? '0 4px 12px rgba(0,0,0,0.5)' 
              : '0 4px 12px rgba(0,0,0,0.15)',
            padding: '8px',
            minWidth: '200px',
            zIndex: 1000
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${isDark ? '#334155' : '#e0e0e0'}`,
              marginBottom: '8px'
            }}>
              <div style={{ 
                fontWeight: '600',
                color: isDark ? '#f1f5f9' : '#212121',
                marginBottom: '4px'
              }}>
                {user.name}
              </div>
              <div style={{ 
                fontSize: '12px',
                color: isDark ? '#94a3b8' : '#666'
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
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#fee2e2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              🚪 Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};
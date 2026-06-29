import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '10px 14px',
        borderRadius: '9999px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: 'var(--shadow-sm)',
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)';
        e.currentTarget.style.borderColor = 'var(--accent-purple)';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(124, 58, 237, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {isLight ? '🌙' : '☀️'}
    </button>
  );
};
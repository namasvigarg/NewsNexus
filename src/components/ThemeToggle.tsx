import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 12px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
        color: 'white',
        cursor: 'pointer',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)';
      }}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
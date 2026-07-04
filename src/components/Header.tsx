import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const isDark = theme === 'dark';

  return (
    <header 
      style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: 'var(--text-primary)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: isDark 
          ? '0 4px 20px rgba(0, 0, 0, 0.25)' 
          : '0 4px 20px rgba(79, 70, 229, 0.05)',
        zIndex: 100,
        position: 'relative'
      }}
    >
      <h1 
        style={{ 
          margin: 0, 
          fontSize: '26px', 
          fontWeight: '800', 
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.75px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onClick={() => window.location.reload()}
      >
        <span>📰</span>
        <span className="gradient-text">NewsNexus</span>
      </h1>
      
      {user && (
        <form onSubmit={handleSubmit} style={{ flex: '0 1 480px', margin: '0 20px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search news by topic, title, source..."
              style={{
                width: '100%',
                padding: '12px 48px 12px 20px',
                borderRadius: '9999px',
                border: searchFocused 
                  ? '1px solid var(--accent-purple)' 
                  : '1px solid var(--border-color)',
                fontSize: '14px',
                fontWeight: '500',
                outline: 'none',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.9)',
                color: 'var(--text-primary)',
                boxShadow: searchFocused 
                  ? '0 0 0 4px rgba(124, 58, 237, 0.15)' 
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: searchFocused ? 'var(--gradient-accent)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: searchFocused ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              🔍
            </button>
          </div>
        </form>
      )}
      {!user && <div style={{ flex: '0 1 480px' }} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <UserMenu />
        <ThemeToggle />
      </div>
    </header>
  );
};
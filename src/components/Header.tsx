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
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const isDark = theme === 'dark';

  return (
    <header style={{
      backgroundColor: isDark ? '#1a1a2e' : '#1976d2',
      color: 'white',
      padding: '15px 30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'background-color 0.3s'
    }}>
      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
        📰 NewsNexus
      </h1>
      
      <form onSubmit={handleSubmit} style={{ flex: '0 1 500px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search news..."
            style={{
              width: '100%',
              padding: '10px 40px 10px 15px',
              borderRadius: '25px',
              border: 'none',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: isDark ? '#2d2d44' : 'white',
              color: isDark ? '#fff' : '#333'
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '5px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '5px 10px'
            }}
          >
            🔍
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <UserMenu />
        <ThemeToggle />
      </div>
    </header>
  );
};
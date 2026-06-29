import React from 'react';
import { CATEGORIES } from '../types';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentView: string;
  currentCategory: string | null;
  onViewChange: (view: 'news' | 'recommendations' | 'saved' | 'dashboard') => void;
  onCategoryClick: (category: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, currentCategory, onViewChange, onCategoryClick }) => {
  const { fetchNews } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleCategoryClick = (category: string) => {
    onCategoryClick(category);
  };

  const handleAllNewsClick = () => {
    fetchNews();
    onViewChange('news');
  };

  // Button style builder
  const getNavButtonStyle = (isActive: boolean) => {
    return {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '12px 18px',
      marginBottom: '8px',
      border: 'none',
      borderRadius: '12px',
      background: isActive ? 'var(--gradient-accent)' : 'transparent',
      color: isActive ? '#ffffff' : 'var(--text-secondary)',
      textAlign: 'left' as const,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
      position: 'relative' as const,
      transform: isActive ? 'translateX(4px)' : 'translateX(0)'
    };
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      overflowY: 'auto',
      transition: 'all 0.3s'
    }}>
      <nav>
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ 
            fontSize: '11px', 
            fontWeight: '800', 
            marginBottom: '16px', 
            color: 'var(--text-secondary)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            paddingLeft: '12px'
          }}>
            Discovery Hub
          </h3>
          
          <button
            onClick={handleAllNewsClick}
            style={getNavButtonStyle(currentView === 'news')}
            onMouseEnter={(e) => {
              if (currentView !== 'news') {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'news') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>🏠</span>
            All News
          </button>

          <button
            onClick={() => onViewChange('recommendations')}
            style={getNavButtonStyle(currentView === 'recommendations')}
            onMouseEnter={(e) => {
              if (currentView !== 'recommendations') {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'recommendations') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>✨</span>
            Personalized News
          </button>

          <button
            onClick={() => onViewChange('saved')}
            style={getNavButtonStyle(currentView === 'saved')}
            onMouseEnter={(e) => {
              if (currentView !== 'saved') {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'saved') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>🔖</span>
            Saved Articles
          </button>

          <button
            onClick={() => onViewChange('dashboard')}
            style={getNavButtonStyle(currentView === 'dashboard')}
            onMouseEnter={(e) => {
              if (currentView !== 'dashboard') {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'dashboard') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>👤</span>
            Dashboard
          </button>
        </div>

        <div>
          <h3 style={{ 
            fontSize: '11px', 
            fontWeight: '800', 
            marginBottom: '16px', 
            color: 'var(--text-secondary)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            paddingLeft: '12px'
          }}>
            Categories
          </h3>
          
          {CATEGORIES.map((category) => {
            const isActive = currentCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '10px 18px',
                  marginBottom: '6px',
                  border: 'none',
                  borderRadius: '10px',
                  backgroundColor: isActive 
                    ? (isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff')
                    : 'transparent',
                  color: isActive 
                    ? 'var(--accent-purple)'
                    : 'var(--text-secondary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '500',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span style={{ marginRight: '10px', fontSize: '12px' }}>
                  {category === 'business' && '💼'}
                  {category === 'entertainment' && '🎬'}
                  {category === 'health' && '🏥'}
                  {category === 'science' && '🔬'}
                  {category === 'sports' && '⚽'}
                  {category === 'technology' && '💻'}
                </span>
                {category}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};
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

  return (
    <aside style={{
      width: '250px',
      backgroundColor: isDark ? '#16213e' : '#fff',
      borderRight: `1px solid ${isDark ? '#2d3748' : '#e0e0e0'}`,
      padding: '20px',
      overflow: 'auto',
      transition: 'background-color 0.3s, border-color 0.3s'
    }}>
      <nav>
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '15px', 
            color: isDark ? '#9ca3af' : '#666' 
          }}>
            NAVIGATION
          </h3>
          
          <button
            onClick={handleAllNewsClick}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 15px',
              marginBottom: '8px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: currentView === 'news' 
                ? (isDark ? '#1e40af' : '#e3f2fd')
                : 'transparent',
              color: currentView === 'news' 
                ? (isDark ? '#fff' : '#1976d2')
                : (isDark ? '#d1d5db' : '#333'),
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: currentView === 'news' ? '600' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            🏠 All News
          </button>

          <button
            onClick={() => onViewChange('recommendations')}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 15px',
              marginBottom: '8px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: currentView === 'recommendations' 
                ? (isDark ? '#1e40af' : '#e3f2fd')
                : 'transparent',
              color: currentView === 'recommendations' 
                ? (isDark ? '#fff' : '#1976d2')
                : (isDark ? '#d1d5db' : '#333'),
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: currentView === 'recommendations' ? '600' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            ✨ For You
          </button>

          <button
            onClick={() => onViewChange('saved')}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 15px',
              marginBottom: '8px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: currentView === 'saved' 
                ? (isDark ? '#1e40af' : '#e3f2fd')
                : 'transparent',
              color: currentView === 'saved' 
                ? (isDark ? '#fff' : '#1976d2')
                : (isDark ? '#d1d5db' : '#333'),
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: currentView === 'saved' ? '600' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            🔖 Saved Articles
          </button>

          <button
            onClick={() => onViewChange('dashboard')}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 15px',
              marginBottom: '8px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: currentView === 'dashboard' 
                ? (isDark ? '#1e40af' : '#e3f2fd')
                : 'transparent',
              color: currentView === 'dashboard' 
                ? (isDark ? '#fff' : '#1976d2')
                : (isDark ? '#d1d5db' : '#333'),
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: currentView === 'dashboard' ? '600' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            📊 Dashboard
          </button>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '15px', 
            color: isDark ? '#9ca3af' : '#666' 
          }}>
            CATEGORIES
          </h3>
          
          {CATEGORIES.map((category) => {
            const isActive = currentCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 15px',
                  marginBottom: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isActive 
                    ? (isDark ? '#1e40af' : '#e3f2fd')
                    : 'transparent',
                  color: isActive 
                    ? (isDark ? '#fff' : '#1976d2')
                    : (isDark ? '#d1d5db' : '#333'),
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : 'normal',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};
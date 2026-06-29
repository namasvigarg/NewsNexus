import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../types';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';

interface DashboardProps {
  onArticleClick: (article: Article) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onArticleClick }) => {
  const { user, isAuthenticated } = useAuth();
  const { newsState, userPreferences, updateUserPreferences } = useStore();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'history' | 'analytics'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const isDark = theme === 'dark';

  // Load and seed read logs for analytics calculations
  const logsKey = user ? `newsNexusReadLogs_${user.id}` : 'newsNexusReadLogs_guest';
  const [readLogs, setReadLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    let logs = JSON.parse(localStorage.getItem(logsKey) || '[]');
    
    // Seed mock data if logs are empty, to demonstrate layout metrics
    if (logs.length === 0) {
      const mockSources = ['Space Science Daily', 'Global Sports Network', 'Tech Vanguard', 'Physics Review', 'Silicon Insider'];
      const mockCategories = ['science', 'sports', 'technology', 'business', 'health'];
      const seededLogs = [];
      
      // Seed 14 articles read over the last 6 days to show streak & stats
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        // Add 1-3 articles per day
        const count = i === 4 ? 0 : Math.floor(Math.random() * 2) + 1; // leave 1 day empty to show dynamic calculations
        for (let j = 0; j < count; j++) {
          seededLogs.push({
            articleId: `seeded_${i}_${j}`,
            timestamp: date.getTime() - (j * 3 * 3600 * 1000), // separate hours
            category: mockCategories[Math.floor(Math.random() * mockCategories.length)],
            source: mockSources[Math.floor(Math.random() * mockSources.length)],
            readingTimeMin: Math.floor(Math.random() * 3) + 2 // 2 to 5 mins
          });
        }
      }
      localStorage.setItem(logsKey, JSON.stringify(seededLogs));
      logs = seededLogs;
    }
    setReadLogs(logs);
  }, [user?.id]);

  useEffect(() => {
    // Load all cached articles
    const cachedArticles = localStorage.getItem('newsNexusAllArticles');
    if (cachedArticles) {
      try {
        const parsed = JSON.parse(cachedArticles);
        setAllArticles(parsed);
      } catch (e) {
        console.error('Error parsing cached articles:', e);
      }
    }
    
    // Merge with current newsState
    if (newsState.articles.length > 0) {
      setAllArticles(prev => {
        const articlesMap = new Map<string, Article>();
        prev.forEach(a => articlesMap.set(a.id, a));
        newsState.articles.forEach(a => articlesMap.set(a.id, a));
        return Array.from(articlesMap.values());
      });
    }
  }, [newsState.articles]);

  if (!isAuthenticated || !user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'float 4s ease-in-out infinite' }}>🔒</div>
        <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Please sign in to view your dashboard configuration.</p>
      </div>
    );
  }

  const savedArticles = allArticles.filter(article => 
    user.savedArticles.includes(article.id)
  );

  const readArticles = allArticles.filter(article => 
    userPreferences.readArticles.includes(article.id)
  );

  const toggleCategory = (category: string) => {
    const newCategories = userPreferences.categories.includes(category)
      ? userPreferences.categories.filter(c => c !== category)
      : [...userPreferences.categories, category];
    updateUserPreferences({ categories: newCategories });
  };

  const handleSaveProfile = () => {
    // Update user name in localStorage
    const users = JSON.parse(localStorage.getItem('newsNexusUsers') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === user.id ? { ...u, name: editedName } : u
    );
    localStorage.setItem('newsNexusUsers', JSON.stringify(updatedUsers));
    
    const updatedUser = { ...user, name: editedName };
    localStorage.setItem('newsNexusUser', JSON.stringify(updatedUser));
    
    setEditMode(false);
    window.location.reload(); // Refresh to update name in header
  };

  // Calculation helpers for Analytics Tab
  const now = Date.now();
  const oneDayMs = 24 * 3600 * 1000;
  
  const todayMs = new Date().setHours(0,0,0,0);
  const readToday = readLogs.filter(l => l.timestamp >= todayMs).length;
  const readThisWeek = readLogs.filter(l => l.timestamp >= now - 7 * oneDayMs).length;
  const readThisMonth = readLogs.filter(l => l.timestamp >= now - 30 * oneDayMs).length;
  
  const totalReadingTime = readLogs.reduce((sum, l) => sum + (l.readingTimeMin || 2), 0);
  
  // Groupings
  const categoryCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  readLogs.forEach(l => {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
    sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  });
  
  let mostReadCategory = 'None';
  let maxCatCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCatCount) {
      maxCatCount = count;
      mostReadCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
    }
  });

  let favoriteSource = 'None';
  let maxSourceCount = 0;
  Object.entries(sourceCounts).forEach(([source, count]) => {
    if (count > maxSourceCount) {
      maxSourceCount = count;
      favoriteSource = source;
    }
  });
  
  // Calculate average articles per day
  const avgArticlesPerDay = readLogs.length > 0
    ? (Math.round((readLogs.length / 7) * 10) / 10).toFixed(1)
    : '0';

  // Calculate streak
  let currentStreak = 0;
  let checkDay = new Date();
  while (true) {
    const dayStart = new Date(checkDay).setHours(0,0,0,0);
    const dayEnd = dayStart + oneDayMs;
    const hasReadOnDay = readLogs.some(l => l.timestamp >= dayStart && l.timestamp < dayEnd);
    if (hasReadOnDay) {
      currentStreak++;
      checkDay.setDate(checkDay.getDate() - 1);
    } else {
      // If we checked today and there is nothing, check yesterday before stopping
      if (currentStreak === 0 && checkDay.setHours(0,0,0,0) === new Date().setHours(0,0,0,0)) {
        checkDay.setDate(checkDay.getDate() - 1);
        const hasReadYesterday = readLogs.some(l => {
          const yesterdayStart = new Date(checkDay).setHours(0,0,0,0);
          return l.timestamp >= yesterdayStart && l.timestamp < yesterdayStart + oneDayMs;
        });
        if (hasReadYesterday) {
          checkDay.setDate(checkDay.getDate() - 1);
          currentStreak = 1;
          continue;
        }
      }
      break;
    }
  }
  
  // Weekly Graph Data (Past 7 Days)
  const graphData = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date).setHours(0,0,0,0);
    const dayEnd = dayStart + oneDayMs;
    const count = readLogs.filter(l => l.timestamp >= dayStart && l.timestamp < dayEnd).length;
    
    graphData.push({
      dayName: daysOfWeek[date.getDay()],
      count
    });
  }
  
  const maxGraphCount = Math.max(...graphData.map(d => d.count), 1);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '800',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.75px',
          marginBottom: '8px'
        }}>
          👤 Account Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
          Manage your personal account preferences, reading logs, and saved categories.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '36px',
        borderBottom: '1px solid var(--border-color)',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'profile', label: '👤 Profile' },
          { id: 'preferences', label: '⚙️ Preferences' },
          { id: 'history', label: '📖 History Logs' },
          { id: 'analytics', label: '📊 Reading Analytics' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '14px 28px',
                border: 'none',
                borderBottom: isActive 
                  ? '3px solid var(--accent-purple)' 
                  : '3px solid transparent',
                backgroundColor: 'transparent',
                color: isActive 
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                transform: isActive ? 'translateY(1px)' : 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div 
          className="glass-panel"
          style={{
            borderRadius: '20px',
            padding: '40px',
            boxShadow: isDark 
              ? '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' 
              : '0 10px 30px rgba(99, 102, 241, 0.05)'
          }}
        >
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '800',
            fontFamily: 'var(--font-heading)',
            marginBottom: '30px',
            color: 'var(--text-primary)'
          }}>
            Personal Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Full Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid var(--accent-purple)',
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'white',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    outline: 'none',
                    boxShadow: '0 0 0 4px rgba(124, 58, 237, 0.15)'
                  }}
                />
              ) : (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.3)' : 'rgba(241, 245, 249, 0.5)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '15px'
                }}>
                  {user.name}
                </div>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Email Address
              </label>
              <div style={{
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.3)' : 'rgba(241, 245, 249, 0.5)',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                fontSize: '15px'
              }}>
                {user.email}
              </div>
            </div>



            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginTop: '12px'
            }}>
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '800',
                  fontFamily: 'var(--font-heading)',
                  color: isDark ? '#34d399' : '#16a34a'
                }}>
                  {userPreferences.readArticles.length}
                </div>
                <div style={{ 
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginTop: '6px'
                }}>
                  Articles Read
                </div>
              </div>

              <div style={{
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.05)' : '#fef3c7',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '800',
                  fontFamily: 'var(--font-heading)',
                  color: isDark ? '#fbbf24' : '#d97706'
                }}>
                  {userPreferences.categories.length}
                </div>
                <div style={{ 
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginTop: '6px'
                }}>
                  Selected Topics
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              {editMode ? (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    onClick={handleSaveProfile}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'var(--gradient-accent)',
                      color: 'white',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-glow)',
                      transition: 'all 0.2s'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedName(user.name);
                    }}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-purple)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  ✏️ Edit Profile Settings
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div 
          className="glass-panel"
          style={{
            borderRadius: '20px',
            padding: '40px',
            boxShadow: isDark 
              ? '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' 
              : '0 10px 30px rgba(99, 102, 241, 0.05)'
          }}
        >
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '800',
            fontFamily: 'var(--font-heading)',
            marginBottom: '8px',
            color: 'var(--text-primary)'
          }}>
            Interests & Subscriptions
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            fontWeight: '500'
          }}>
            Select topics below to customize your AI recommendations instantly.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            {CATEGORIES.map((category) => {
              const isSelected = userPreferences.categories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  style={{
                    padding: '20px 24px',
                    borderRadius: '16px',
                    border: isSelected 
                      ? '2px solid var(--accent-purple)' 
                      : '2px solid var(--border-color)',
                    background: isSelected 
                      ? 'var(--gradient-accent)' 
                      : 'var(--glass-bg)',
                    color: isSelected 
                      ? 'white' 
                      : 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--accent-purple)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    } else {
                      e.currentTarget.style.transform = 'scale(1.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    } else {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>
                      {category === 'business' && '💼'}
                      {category === 'entertainment' && '🎬'}
                      {category === 'health' && '🏥'}
                      {category === 'science' && '🔬'}
                      {category === 'sports' && '⚽'}
                      {category === 'technology' && '💻'}
                    </span>
                    {category}
                  </span>
                </button>
              );
            })}
          </div>

          {userPreferences.categories.length === 0 && (
            <div style={{
              marginTop: '32px',
              padding: '18px 24px',
              borderRadius: '14px',
              backgroundColor: isDark ? 'rgba(217, 119, 6, 0.1)' : '#fffbeb',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              color: isDark ? '#fbbf24' : '#b45309',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '15px'
            }}>
              💡 Select at least one category to generate recommendation articles.
            </div>
          )}
        </div>
      )}



      {/* Reading History Tab */}
      {activeTab === 'history' && (
        <div className="animate-fade-in-up">
          {readArticles.length === 0 ? (
            <div 
              className="glass-panel"
              style={{
                borderRadius: '20px',
                padding: '80px 20px',
                textAlign: 'center',
                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(99, 102, 241, 0.05)'
              }}
            >
              <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'float-reverse 4s ease-in-out infinite' }}>📖</div>
              <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '22px', marginBottom: '8px' }}>
                No Read Logs
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                As you click and read articles in details, your logs will populate here.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {readArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => onArticleClick(article)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {/* Articles Read Card */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Articles Read
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {readToday}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>today</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <span>This Week: {readThisWeek}</span>
                <span>This Month: {readThisMonth}</span>
              </div>
            </div>

            {/* Reading Time Card */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Total Reading Time
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-purple)' }}>
                  {totalReadingTime}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>minutes</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <span>Estimated based on average reading speeds</span>
              </div>
            </div>

            {/* Streak Card */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Reading Streak
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b' }}>
                  {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                </span>
                <span style={{ fontSize: '20px' }}>🔥</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <span>Consecutive days reading stories</span>
              </div>
            </div>

            {/* Category Performance Card */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Most Read Category
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>
                  {mostReadCategory}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <span>Top topic of interest</span>
              </div>
            </div>

            {/* Favorite Source Card */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Favorite News Source
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#3b82f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }} title={favoriteSource}>
                  {favoriteSource}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <span>Highest frequency publisher</span>
              </div>
            </div>

            {/* Average articles per day */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Daily Average
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#8b5cf6' }}>
                  {avgArticlesPerDay}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>articles / day</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <span>Calculated over a rolling 7-day scale</span>
              </div>
            </div>
          </div>

          {/* Graph Section */}
          <div className="glass-panel" style={{ padding: '36px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                📅 Weekly Reading Activity
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500', margin: '4px 0 0 0' }}>
                Total pages/articles read per day over the last 7 calendar periods.
              </p>
            </div>

            {/* Pure CSS Vertical Bar Chart */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              height: '160px',
              padding: '10px 20px',
              borderBottom: '1px solid var(--border-color)',
              margin: '20px 0 10px 0',
              gap: '12px'
            }}>
              {graphData.map((d, idx) => {
                const percent = (d.count / maxGraphCount) * 100;
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: d.count > 0 ? 'var(--accent-purple)' : 'var(--text-secondary)' }}>
                      {d.count}
                    </span>
                    <div style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${percent}%`,
                      minHeight: d.count > 0 ? '8px' : '2px',
                      background: d.count > 0 ? 'var(--gradient-accent)' : 'rgba(148, 163, 184, 0.1)',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: d.count > 0 ? '0 4px 12px rgba(124, 58, 237, 0.2)' : 'none'
                    }} />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      {d.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
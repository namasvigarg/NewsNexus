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
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'saved' | 'history'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const isDark = theme === 'dark';

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
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ color: isDark ? '#f1f5f9' : '#212121' }}>Please login to view dashboard</h2>
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          color: isDark ? '#f1f5f9' : '#212121',
          marginBottom: '8px'
        }}>
          👤 User Dashboard
        </h1>
        <p style={{ color: isDark ? '#94a3b8' : '#666' }}>
          Manage your profile, preferences, and saved content
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '30px',
        borderBottom: `2px solid ${isDark ? '#334155' : '#e0e0e0'}`,
        overflowX: 'auto'
      }}>
        {[
          { id: 'profile', label: '👤 Profile', icon: '👤' },
          { id: 'preferences', label: '⚙️ Preferences', icon: '⚙️' },
          { id: 'saved', label: '🔖 Saved', icon: '🔖' },
          { id: 'history', label: '📖 History', icon: '📖' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === tab.id 
                ? `3px solid ${isDark ? '#60a5fa' : '#1976d2'}` 
                : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.id 
                ? (isDark ? '#60a5fa' : '#1976d2')
                : (isDark ? '#94a3b8' : '#666'),
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{
          backgroundColor: isDark ? '#1e293b' : 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '24px',
            color: isDark ? '#f1f5f9' : '#212121'
          }}>
            Personal Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#333'
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
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? '#334155' : '#e0e0e0'}`,
                    backgroundColor: isDark ? '#0f172a' : 'white',
                    color: isDark ? '#f1f5f9' : '#333',
                    fontSize: '14px'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
                  color: isDark ? '#f1f5f9' : '#333'
                }}>
                  {user.name}
                </div>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#333'
              }}>
                Email Address
              </label>
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
                color: isDark ? '#94a3b8' : '#666'
              }}>
                {user.email}
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#333'
              }}>
                User ID
              </label>
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
                color: isDark ? '#94a3b8' : '#666',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                {user.id}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginTop: '12px'
            }}>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#0f172a' : '#f0fdf4',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: isDark ? '#4ade80' : '#16a34a'
                }}>
                  {userPreferences.readArticles.length}
                </div>
                <div style={{ 
                  fontSize: '12px',
                  color: isDark ? '#94a3b8' : '#666',
                  marginTop: '4px'
                }}>
                  Articles Read
                </div>
              </div>

              <div style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#0f172a' : '#fef3c7',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: isDark ? '#fbbf24' : '#d97706'
                }}>
                  {userPreferences.categories.length}
                </div>
                <div style={{ 
                  fontSize: '12px',
                  color: isDark ? '#94a3b8' : '#666',
                  marginTop: '4px'
                }}>
                  Interests
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              {editMode ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleSaveProfile}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isDark ? '#1e40af' : '#1976d2',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer'
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
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? '#334155' : '#e0e0e0'}`,
                      backgroundColor: 'transparent',
                      color: isDark ? '#d1d5db' : '#333',
                      fontWeight: '600',
                      cursor: 'pointer'
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
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? '#334155' : '#e0e0e0'}`,
                    backgroundColor: isDark ? '#1e293b' : 'white',
                    color: isDark ? '#d1d5db' : '#333',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div style={{
          backgroundColor: isDark ? '#1e293b' : 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '12px',
            color: isDark ? '#f1f5f9' : '#212121'
          }}>
            News Preferences
          </h2>
          <p style={{ 
            color: isDark ? '#94a3b8' : '#666',
            marginBottom: '24px'
          }}>
            Select your interests to get personalized recommendations
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {CATEGORIES.map((category) => {
              const isSelected = userPreferences.categories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${
                      isSelected 
                        ? (isDark ? '#60a5fa' : '#1976d2')
                        : (isDark ? '#334155' : '#e0e0e0')
                    }`,
                    backgroundColor: isSelected 
                      ? (isDark ? '#1e40af' : '#e3f2fd')
                      : (isDark ? '#0f172a' : 'white'),
                    color: isSelected 
                      ? (isDark ? '#fff' : '#1976d2')
                      : (isDark ? '#d1d5db' : '#333'),
                    fontSize: '15px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{category}</span>
                  {isSelected && <span>✓</span>}
                </button>
              );
            })}
          </div>

          {userPreferences.categories.length === 0 && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: isDark ? '#422006' : '#fff3cd',
              color: isDark ? '#fbbf24' : '#856404',
              textAlign: 'center'
            }}>
              💡 Select at least one category to get personalized recommendations
            </div>
          )}
        </div>
      )}

      {/* Saved Articles Tab */}
      {activeTab === 'saved' && (
        <div>
          {savedArticles.length === 0 ? (
            <div style={{
              backgroundColor: isDark ? '#1e293b' : 'white',
              borderRadius: '12px',
              padding: '50px',
              textAlign: 'center',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔖</div>
              <h3 style={{ color: isDark ? '#f1f5f9' : '#212121', marginBottom: '8px' }}>
                No saved articles yet
              </h3>
              <p style={{ color: isDark ? '#94a3b8' : '#666' }}>
                Articles you bookmark will appear here
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {savedArticles.map((article) => (
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

      {/* Reading History Tab */}
      {activeTab === 'history' && (
        <div>
          {readArticles.length === 0 ? (
            <div style={{
              backgroundColor: isDark ? '#1e293b' : 'white',
              borderRadius: '12px',
              padding: '50px',
              textAlign: 'center',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
              <h3 style={{ color: isDark ? '#f1f5f9' : '#212121', marginBottom: '8px' }}>
                No reading history
              </h3>
              <p style={{ color: isDark ? '#94a3b8' : '#666' }}>
                Articles you read will be tracked here
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
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
    </div>
  );
};
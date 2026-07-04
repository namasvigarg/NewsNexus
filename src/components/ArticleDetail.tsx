import React, { useEffect, useState } from 'react';
import { Article } from '../types';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { newsAPI } from '../services/api';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

const formatMessageText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    let cleanLine = line.trim();
    const isBullet = cleanLine.startsWith('* ') || cleanLine.startsWith('- ');
    if (isBullet) {
      cleanLine = cleanLine.slice(2);
    }

    const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
    const parsedLine = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isBullet) {
      return (
        <div key={lineIdx} style={{ display: 'flex', gap: '8px', margin: '4px 0', paddingLeft: '8px' }}>
          <span style={{ color: 'inherit', opacity: 0.8 }}>•</span>
          <div>{parsedLine}</div>
        </div>
      );
    }

    return (
      <div key={lineIdx} style={{ minHeight: line.trim() === '' ? '8px' : 'auto' }}>
        {parsedLine}
      </div>
    );
  });
};

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack }) => {
  const { markArticleAsRead } = useStore();
  const { theme } = useTheme();
  const { isAuthenticated, saveArticle, unsaveArticle, isArticleSaved } = useAuth();
  const [showCopied, setShowCopied] = useState(false);
  const [backHovered, setBackHovered] = useState(false);
  const isDark = theme === 'dark';
  const isSaved = isArticleSaved(article.id);

  const [insights, setInsights] = useState<string[]>(article.insights || []);
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    markArticleAsRead(article.id);

    const fetchFullInsights = async () => {
      try {
        setLoadingInsights(true);
        const data = await newsAPI.getArticleInsights(article);
        if (data.insights && data.insights.length > 0) {
          setInsights(data.insights);
        }
      } catch (err) {
        console.error('Error loading full-text insights:', err);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchFullInsights();
  }, [article.id]);

  // AI Chat States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hi! I am your AI reading assistant. Ask me anything about this article, or click one of the quick prompts below!' }
  ]);
  const [customMessage, setCustomMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  const presetQuestions = [
    { label: '💡 Simple Words', query: 'Explain this in simple words.' },
    { label: '🕒 Context / History', query: 'What happened before this?' },
    { label: '📈 Who Benefits', query: 'Who benefits?' },
    { label: '📉 Who Loses', query: 'Who loses?' },
    { label: '⚖️ Assessment', query: 'Is this good or bad?' },
    { label: '🔄 Comparison', query: "Compare this with last year's event." }
  ];

  const handleSendChatMessage = async (messageText: string) => {
    if (!messageText.trim() || chatLoading) return;
    
    // Add user message
    setChatMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setChatLoading(true);
    setChatError('');
    
    try {
      const response = await newsAPI.askAIAboutArticle(article, messageText);
      setChatMessages(prev => [...prev, { sender: 'ai', text: response.reply }]);
    } catch (error: any) {
      console.error('AI chat error:', error);
      setChatError('Failed to get answer from AI. Please try again.');
      setChatMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Sorry, I could not process that request. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      return;
    }
    if (isSaved) {
      unsaveArticle(article.id);
    } else {
      saveArticle(article.id);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(article.url);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '40px' }}>
      <button
        onClick={onBack}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        style={{
          position: 'sticky',
          top: '20px',
          zIndex: 10,
          marginBottom: '24px',
          padding: '12px 24px',
          border: '1px solid var(--border-color)',
          borderRadius: '9999px',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '700',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: backHovered ? 'translateX(-4px)' : 'translateX(0)'
        }}
      >
        <span>←</span> Back to Feed
      </button>

      <article 
        className="glass-panel"
        style={{
          borderRadius: '24px',
          padding: '48px',
          boxShadow: isDark 
            ? '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)' 
            : '0 20px 40px rgba(99, 102, 241, 0.05)',
          transition: 'all 0.3s'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '800',
            color: 'var(--accent-purple)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px'
          }}>
            {article.source}
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleBookmark}
              title={isSaved ? 'Remove from saved' : 'Save article'}
              style={{
                padding: '10px 18px',
                borderRadius: '9999px',
                border: '1px solid var(--border-color)',
                backgroundColor: isSaved ? 'var(--gradient-accent)' : 'var(--glass-bg)',
                color: isSaved ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isSaved ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (!isSaved) {
                  e.currentTarget.style.borderColor = 'var(--accent-purple)';
                } else {
                  e.currentTarget.style.transform = 'scale(1.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaved) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                } else {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {isSaved ? '🔖 Saved' : '📑 Save'}
            </button>
            <button
              onClick={handleShare}
              title="Copy article link"
              style={{
                padding: '10px 18px',
                borderRadius: '9999px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--glass-bg)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-purple)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {showCopied ? '✅ Copied!' : '🔗 Share'}
            </button>
          </div>
        </div>

        <h1 style={{
          margin: '0 0 24px 0',
          fontSize: '36px',
          fontWeight: '800',
          lineHeight: '1.3',
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.75px'
        }}>
          {article.title}
        </h1>

        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '36px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          fontWeight: '500'
        }}>
          {article.author && (
            <span>
              <strong>By</strong> {article.author}
            </span>
          )}
          <span>📅 {formatDate(article.publishedAt)}</span>
        </div>

        {article.urlToImage && (
          <div style={{
            marginBottom: '36px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)'
          }}>
            <img
              src={article.urlToImage}
              alt={article.title}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        )}

        {article.description && (
          <p style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: 'var(--text-primary)',
            marginBottom: '30px',
            fontWeight: '500',
            opacity: 0.95
          }}>
            {article.description}
          </p>
        )}

        {insights && insights.length > 0 && (
          <div 
            style={{ 
              margin: '0 0 30px 0', 
              padding: '24px',
              backgroundColor: isDark ? 'rgba(124, 58, 237, 0.05)' : '#f5f3ff',
              border: '1px solid var(--border-glow-hover)',
              borderRadius: '16px'
            }}
          >
            <h3 style={{
              fontSize: '14px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--accent-purple)',
              marginBottom: '16px',
              fontFamily: 'var(--font-heading)'
            }}>
              ✨ Key Insights Summary {loadingInsights && <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '8px', textTransform: 'none', letterSpacing: '0' }}>(updating from full article...)</span>}
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: '18px',
              fontSize: '15px',
              color: 'var(--text-primary)',
              lineHeight: '1.7',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {insights.map((insight, idx) => (
                <li key={idx} style={{ listStyleType: 'disc' }}>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}


        {/* AI Reading Assistant Chat Section */}
        <div style={{
          marginTop: '48px',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          overflow: 'hidden',
          boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(99, 102, 241, 0.05)'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: isDark ? 'rgba(124, 58, 237, 0.08)' : 'rgba(124, 58, 237, 0.03)'
          }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)'
              }}>
                AI Article Co-Pilot
              </h3>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                Ask details or use the prompt templates below
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{
            padding: '24px',
            maxHeight: '350px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255, 255, 255, 0.1)'
          }}>
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 18px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  backgroundColor: msg.sender === 'user' 
                    ? 'var(--accent-purple)' 
                    : (isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff'),
                  border: msg.sender === 'user' 
                    ? 'none' 
                    : '1px solid var(--border-color)',
                  color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontWeight: '500',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'left'
                }}>
                  {formatMessageText(msg.text)}
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  padding: '12px 18px',
                  borderRadius: '18px 18px 18px 2px',
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  Reading article insights...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Panel */}
          <div style={{
            padding: '16px 24px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.8)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <p style={{
              margin: '0 0 10px 0',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.75px',
              color: 'var(--text-secondary)',
              textAlign: 'left'
            }}>
              Suggested Questions
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {presetQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChatMessage(q.query)}
                  disabled={chatLoading}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: chatLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    if (!chatLoading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.borderColor = 'var(--accent-purple)';
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff';
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Input Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (customMessage.trim()) {
                handleSendChatMessage(customMessage);
                setCustomMessage('');
              }
            }}
            style={{
              padding: '16px 24px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.5)'
            }}
          >
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Ask a custom question about this article..."
              disabled={chatLoading}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
            <button
              type="submit"
              disabled={!customMessage.trim() || chatLoading}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--gradient-accent)',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
                cursor: (!customMessage.trim() || chatLoading) ? 'not-allowed' : 'pointer',
                opacity: (!customMessage.trim() || chatLoading) ? 0.6 : 1,
                transition: 'all 0.3s',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Send
            </button>
          </form>
        </div>

        <div style={{
          marginTop: '48px',
          padding: '32px',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <p style={{ 
            marginBottom: '20px', 
            color: 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            Read the full article at the original publisher.
          </p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              background: 'var(--gradient-accent)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '9999px',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow: 'var(--shadow-glow)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(124, 58, 237, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }}
          >
            Read Full Article →
          </a>
        </div>
      </article>
    </div>
  );
};
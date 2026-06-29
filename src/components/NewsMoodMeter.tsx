import React from 'react';
import { Article } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NewsMoodMeterProps {
  articles: Article[];
}

export const NewsMoodMeter: React.FC<NewsMoodMeterProps> = ({ articles }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const positiveWords = [
    'gain', 'rise', 'win', 'benefit', 'success', 'grow', 'improve', 'boost', 
    'breakthrough', 'advance', 'recovery', 'save', 'safe', 'deal', 'agreement',
    'positive', 'good', 'happy', 'higher', 'support', 'promise', 'launch'
  ];
  
  const negativeWords = [
    'loss', 'drop', 'fail', 'decline', 'protest', 'clash', 'crisis', 'warn',
    'risk', 'fear', 'worry', 'danger', 'death', 'kill', 'accident', 'arrest',
    'court', 'hearing', 'lawsuit', 'ban', 'cut', 'fire', 'strike', 'inflation',
    'recession', 'negative', 'bad', 'damage', 'hurt', 'threat', 'cancel'
  ];

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  articles.forEach(article => {
    // If the backend has provided a high-accuracy Gemini or fallback sentiment, use it!
    if (article.sentiment) {
      if (article.sentiment === 'positive') {
        positiveCount++;
      } else if (article.sentiment === 'negative') {
        negativeCount++;
      } else {
        neutralCount++;
      }
      return;
    }

    // Secondary / Fallback lexical keyword analysis
    const text = `${article.title} ${article.description || ''}`.toLowerCase();
    let score = 0;
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 1;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 1;
    });

    if (score > 0) {
      positiveCount++;
    } else if (score < 0) {
      negativeCount++;
    } else {
      neutralCount++;
    }
  });

  const total = positiveCount + neutralCount + negativeCount;
  
  // Handlers for empty or uncalculated states
  const positive = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
  const neutral = total > 0 ? Math.round((neutralCount / total) * 100) : 0;
  const negative = total > 0 ? Math.round((negativeCount / total) * 100) : 0;

  // Make sure they sum exactly to 100 if total > 0, otherwise standard fallback
  let displayPos = positive;
  let displayNeu = neutral;
  let displayNeg = negative;
  
  if (total > 0) {
    const sum = positive + neutral + negative;
    if (sum !== 100) {
      displayNeu += (100 - sum);
    }
  } else {
    displayPos = 33;
    displayNeu = 34;
    displayNeg = 33;
  }

  return (
    <div 
      className="glass-panel animate-fade-in-up" 
      style={{
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '32px',
        boxShadow: isDark 
          ? '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)' 
          : '0 10px 30px rgba(99, 102, 241, 0.05), inset 0 1px 0 rgba(255,255,255,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'left'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h4 style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.75px',
            color: 'var(--accent-purple)',
            fontFamily: 'var(--font-heading)'
          }}>
            Insights Overview
          </h4>
          <h3 style={{
            margin: '4px 0 0 0',
            fontSize: '20px',
            fontWeight: '800',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)'
          }}>
            📰 News Mood Meter
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            Real-time aggregate sentiment breakdown of today's reads.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>😊</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Positive</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#10b981', lineHeight: '1.2' }}>{displayPos}%</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>😐</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Neutral</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#94a3b8', lineHeight: '1.2' }}>{displayNeu}%</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>😟</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Negative</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#ef4444', lineHeight: '1.2' }}>{displayNeg}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Distribution Bar */}
      <div style={{
        display: 'flex',
        height: '10px',
        width: '100%',
        borderRadius: '9999px',
        overflow: 'hidden',
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#e2e8f0',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: `${displayPos}%`,
          backgroundColor: '#10b981',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }} title={`Positive: ${displayPos}%`} />
        <div style={{
          width: `${displayNeu}%`,
          backgroundColor: '#94a3b8',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }} title={`Neutral: ${displayNeu}%`} />
        <div style={{
          width: `${displayNeg}%`,
          backgroundColor: '#ef4444',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }} title={`Negative: ${displayNeg}%`} />
      </div>
    </div>
  );
};

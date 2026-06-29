import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  savedArticles: string[];
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string, name: string) => Promise<AuthResult>;
  logout: () => void;
  saveArticle: (articleId: string) => void;
  unsaveArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Verification hook on mount to check existing session tokens
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('newsNexusToken');
      if (token) {
        try {
          const response = await fetch(`${API_BASE}/user/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('newsNexusToken');
          }
        } catch (error) {
          console.error('Session verification error:', error);
          localStorage.removeItem('newsNexusToken');
        }
      }
    };
    checkAuth();
  }, []);

  const signup = async (email: string, password: string, name: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      
      localStorage.setItem('newsNexusToken', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Signup request failed' };
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }
      
      localStorage.setItem('newsNexusToken', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login request failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('newsNexusToken');
  };

  const saveArticle = async (articleId: string) => {
    if (!user) return;
    const token = localStorage.getItem('newsNexusToken');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/user/save/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ articleId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, savedArticles: data.savedArticles } : null);
      }
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  const unsaveArticle = async (articleId: string) => {
    if (!user) return;
    const token = localStorage.getItem('newsNexusToken');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/user/unsave/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ articleId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, savedArticles: data.savedArticles } : null);
      }
    } catch (error) {
      console.error('Error unsaving article:', error);
    }
  };

  const isArticleSaved = (articleId: string): boolean => {
    if (!user) return false;
    return user.savedArticles.includes(articleId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        saveArticle,
        unsaveArticle,
        isArticleSaved
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
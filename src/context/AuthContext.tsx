import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';

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
  updateEmail: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Verification hook on mount to check existing session tokens and listen to auth changes
  useEffect(() => {
    let active = true;

    const checkAuthAndSync = async (session: any) => {
      if (session) {
        const token = session.access_token;
        localStorage.setItem('newsNexusToken', token);
        try {
          const response = await fetch(`${API_BASE}/user/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (active) {
              setUser(data.user);
            }
          } else {
            // Fallback user state in case the server has a temporary error
            if (active) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
                savedArticles: []
              });
            }
          }
        } catch (error) {
          console.error('Session verification error:', error);
          if (active) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
              savedArticles: []
            });
          }
        }
      } else {
        localStorage.removeItem('newsNexusToken');
        if (active) {
          setUser(null);
        }
      }
    };

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await checkAuthAndSync(session);
      } catch (err) {
        console.error('Error getting initial session:', err);
      }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await checkAuthAndSync(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string, name: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Signup request failed' };
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login request failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  const updateEmail = async (email: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.updateUser({ email });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update email' };
    }
  };

  const updatePassword = async (password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update password' };
    }
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
        isArticleSaved,
        updateEmail,
        updatePassword
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
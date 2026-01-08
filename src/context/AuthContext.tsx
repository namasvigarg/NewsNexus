import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  savedArticles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  saveArticle: (articleId: string) => void;
  unsaveArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('newsNexusUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('newsNexusUsers') || '[]');
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        alert('User with this email already exists!');
        return false;
      }

      // Create new user
      const newUser: User & { password: string } = {
        id: `user_${Date.now()}`,
        email,
        name,
        password, // In production, hash this!
        savedArticles: []
      };

      users.push(newUser);
      localStorage.setItem('newsNexusUsers', JSON.stringify(users));

      // Login the user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('newsNexusUser', JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('newsNexusUsers') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);

      if (!foundUser) {
        alert('Invalid email or password!');
        return false;
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('newsNexusUser', JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('newsNexusUser');
  };

  const saveArticle = (articleId: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      savedArticles: [...user.savedArticles, articleId]
    };

    setUser(updatedUser);
    localStorage.setItem('newsNexusUser', JSON.stringify(updatedUser));

    // Update in users array
    const users = JSON.parse(localStorage.getItem('newsNexusUsers') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === user.id ? { ...u, savedArticles: updatedUser.savedArticles } : u
    );
    localStorage.setItem('newsNexusUsers', JSON.stringify(updatedUsers));
  };

  const unsaveArticle = (articleId: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      savedArticles: user.savedArticles.filter(id => id !== articleId)
    };

    setUser(updatedUser);
    localStorage.setItem('newsNexusUser', JSON.stringify(updatedUser));

    // Update in users array
    const users = JSON.parse(localStorage.getItem('newsNexusUsers') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === user.id ? { ...u, savedArticles: updatedUser.savedArticles } : u
    );
    localStorage.setItem('newsNexusUsers', JSON.stringify(updatedUsers));
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
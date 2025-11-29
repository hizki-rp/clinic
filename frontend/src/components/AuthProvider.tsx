import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';

interface User {
  id: number;
  username: string;
  role: string;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isReceptionist: boolean;
  isDoctor: boolean;
  isLaboratory: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    console.log('Login attempt:', { username, password });
    
    try {
      // Call the Django backend JWT authentication endpoint
      const response = await authApi.login({ username, password });
      
      // Store JWT tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Fetch user profile to get role and other details
      const userResponse = await fetch(`${API_BASE_URL}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${response.access}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const userData = await userResponse.json();
      
      const user = {
        id: userData.id,
        username: userData.username,
        role: userData.role,
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
      };
      
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Login successful:', user);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  const isReceptionist = user?.role === 'reception';
  const isDoctor = user?.role === 'doctor';
  const isLaboratory = user?.role === 'laboratory';

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, isReceptionist, isDoctor, isLaboratory }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
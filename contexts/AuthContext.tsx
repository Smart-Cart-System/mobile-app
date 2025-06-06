import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '@/services/secureStore';
import { authAPI, UserCreatePayload, LoginResponse } from '@/services/api';

// Define the shape of the user data to be stored in the context
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (payload: UserCreatePayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await storage.getItem('userToken');
        const storedUser = await storage.getItem('userData');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load auth data from storage", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);
  const handleLoginSuccess = async (data: LoginResponse) => {
    const authUser: AuthUser = {
        id: data.user_id,
        username: data.username,
        email: data.email,
        fullName: data.full_name,
        phoneNumber: data.phone_number,
        address: data.address,
    };
    setToken(data.access_token);
    setUser(authUser);
    await storage.setItem('userToken', data.access_token);
    await storage.setItem('userData', JSON.stringify(authUser));
  };
  
  const login = async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const data = await authAPI.login(formData);
    await handleLoginSuccess(data);
  };
    const signup = async (payload: UserCreatePayload) => {
    // Signup does not automatically log the user in per the docs.
    // If it should, this flow would need to be updated to also call login.
    await authAPI.signup(payload);
    // You might want to show a success message and redirect to the login screen.
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.deleteItem('userToken');
    await storage.deleteItem('userData');
  };
  
  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!token, isLoading, login, signup, logout }}>
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

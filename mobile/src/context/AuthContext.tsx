import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  selectedRole: 'caregiver' | 'patient';
  setSelectedRole: (role: 'caregiver' | 'patient') => void;
  login: (email: string, password: string, role: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<'caregiver' | 'patient'>('caregiver');

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authApi.login(email, password, role);
      setUser(loggedUser);
      setSelectedRole(loggedUser.role);
      setIsLoading(false);
      return loggedUser;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      const newUser = await authApi.register(payload);
      setUser(newUser);
      setSelectedRole(newUser.role);
      setIsLoading(false);
      return newUser;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        selectedRole,
        setSelectedRole,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

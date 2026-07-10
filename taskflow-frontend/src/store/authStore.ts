import { create } from 'zustand';
import type { AuthUser, AuthResponse } from '../types/auth.types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
}

const getStoredUser = (): AuthUser | null => {
  try {
    const userStr = localStorage.getItem('taskflow-user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => localStorage.getItem('taskflow-token');

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),

  setAuth: (data) => {
    const user: AuthUser = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem('taskflow-token', data.token);
    localStorage.setItem('taskflow-user', JSON.stringify(user));
    set({ user, token: data.token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('taskflow-token');
    localStorage.removeItem('taskflow-user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
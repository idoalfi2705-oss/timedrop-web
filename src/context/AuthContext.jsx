import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const ROLES = {
  EMPLOYER: 'employer',
  WORKER:   'worker',
  CLIENT:   'client',
};

const MOCK_USERS = [
  { id: 1, name: 'דוד כהן',    role: 'employer', orgCode: 'TD001', avatar: 'ד' },
  { id: 2, name: 'יוסי לוי',   role: 'worker',   orgCode: 'TD001', avatar: 'י' },
  { id: 3, name: 'רחל מזרחי',  role: 'client',   orgCode: 'TD001', avatar: 'ר' },
];

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser  = sessionStorage.getItem('td_user');
    const savedToken = sessionStorage.getItem('td_token');
    if (savedUser && savedToken) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async ({ orgCode, username, password }) => {
    // נסה Backend אמיתי קודם
    try {
      const data = await authAPI.login({ orgCode, username, password });
      sessionStorage.setItem('td_token', data.token);
      sessionStorage.setItem('td_user',  JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch {
      // fallback למשתמשי דמו
      const userMap = { david: 0, yossi: 1, rachel: 2 };
      const idx = userMap[username];
      if (idx === undefined || password !== '1234' || orgCode !== 'TD001') {
        throw new Error('פרטי ההתחברות שגויים');
      }
      const found = MOCK_USERS[idx];
      sessionStorage.setItem('td_token', 'mock_token');
      sessionStorage.setItem('td_user',  JSON.stringify(found));
      setUser(found);
      return found;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('td_token');
    sessionStorage.removeItem('td_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

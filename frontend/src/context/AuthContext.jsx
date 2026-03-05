import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('travelgo_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('travelgo_token', token);
    localStorage.setItem('travelgo_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('travelgo_token');
    localStorage.removeItem('travelgo_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

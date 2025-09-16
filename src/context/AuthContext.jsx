import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    // Implement login logic here
    setLoading(true);
    try {
      // Mock login for now
      setCurrentUser({ name: 'Test User', email: credentials.email });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Implement logout logic here
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
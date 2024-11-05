import React, { createContext, useState, useContext } from 'react';
import { Platform } from 'react-native';

// AuthContext létrehozása
const AuthContext = createContext();

// AuthProvider komponens, amely minden képernyőhöz hozzáférést ad az állapothoz
export function AuthProvider({ children }) {
  const platform = (Platform.OS === 'web' ? Platform.OS : 'mobile');
  const devHost = (platform == 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000');

  const [platformdata, setPlatformData] = useState({platform:platform,devHost:devHost}); 
  const [user, setUser] = useState(null); 
  const [loggedIn, setLoggedIn] = useState(false);

  const logIn = (userData) => { 
    setUser(userData); 
    setLoggedIn(true); 
  };
  const logOut = () => { setUser(null); setLoggedIn(false); }

  return (
    <AuthContext.Provider value={{ platformdata, user, loggedIn, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Egyedi hook a könnyebb eléréshez
export function useAuth() {
  return useContext(AuthContext);
}
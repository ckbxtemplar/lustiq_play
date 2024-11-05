import React, { createContext, useState,useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AuthContext létrehozása
const AuthContext = createContext();

// AuthProvider komponens, amely minden képernyőhöz hozzáférést ad az állapothoz
export function AuthProvider({ children }) {
  const platform = (Platform.OS === 'web' ? Platform.OS : 'mobile');
  const devHost = (platform == 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000');

  const [platformdata, setPlatformData] = useState({platform:platform,devHost:devHost}); 
  const [user, setUser] = useState(null); 
  const [loggedIn, setLoggedIn] = useState(false);

  const logIn = async (userData) => { 
    setUser(userData); 
    setLoggedIn(true); 
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };
  const logOut = async () => { 
    setUser(null); 
    setLoggedIn(false); 
    await AsyncStorage.removeItem('user');
  }

  useEffect(() => {
    const checkUserSession = async () => {
      const userSession = await AsyncStorage.getItem('user');
      if (userSession) {
        setUser(JSON.parse(userSession));
        setLoggedIn(true);
      }
    };
    checkUserSession();
  }, []);

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

console.log('https://lustiq.eu');
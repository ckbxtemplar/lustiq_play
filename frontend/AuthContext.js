import React, { createContext, useState,useEffect, useContext, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AuthContext létrehozása
const AuthContext = createContext();

// AuthProvider komponens, amely minden képernyőhöz hozzáférést ad az állapothoz
export function AuthProvider({ children }) {
  const platform = (Platform.OS === 'web' ? Platform.OS : 'mobile');
  const devHost = (platform == 'web' ? 'localhost' : '10.0.2.2');
  const ws = useRef(null);
  const [serverMessage, setServerMessage] = useState('');

  const [platformdata] = useState({platform:platform,devHost:devHost}); 
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

  // WebSocket kezelés a loggedIn állapot alapján
  useEffect(() => {
    
    if (loggedIn) {
      const userId = user.userId;      
      // WebSocket kapcsolat létesítése
      ws.current = new WebSocket(`ws://${devHost}:8080`);

      ws.current.onopen = () => {
        console.log('Connected to WS server');

        // Bejelentkezési üzenet küldése a szervernek
        ws.current.send(JSON.stringify({ type: 'hello', userId }));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'welcome') {
          setServerMessage(data.message);
          console.log('Message from WS server:', data.message);
        } else if (data.type === 'notification') {
          setServerMessage(data.message);
          console.log('Message from WS server:', data.message);
        }
      };

      ws.current.onclose = () => {
        console.log('Disconnected from WS server');
      };
    } else if (ws.current) {
      // WebSocket kapcsolat bezárása, ha nincs bejelentkezés
      ws.current.close();
      ws.current = null;
    }

    // Cleanup függvény a kapcsolat lezárására
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [loggedIn]); // A függvény csak akkor fut, ha a loggedIn állapot változik

  return (
    <AuthContext.Provider value={{ platformdata, user, loggedIn, logIn, logOut, serverMessage, ws }}>
      {children}
    </AuthContext.Provider>
  );
}

// Egyedi hook a könnyebb eléréshez
export function useAuth() {
  return useContext(AuthContext);
}

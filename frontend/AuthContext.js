import React, { createContext, useState,useEffect, useContext, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AuthContext létrehozása
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const platform = (Platform.OS === 'web' ? Platform.OS : 'mobile');
  const devHost = (platform == 'web' ? 'localhost' : '10.0.2.2');
  const ws = useRef(null);

  const [platformdata] = useState({platform:platform,devHost:devHost}); 
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [joinedUser, setJoinedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [gameReady, setGameReady] = useState(false);  

  const logIn = async (userData) => {
    setUser(userData); 
    setLoggedIn(true); 
    await AsyncStorage.setItem('user', JSON.stringify(user));
  };
  const logOut = async () => { 
    setUser(null); 
    setJoinedUser(null);
    setLoggedIn(false); 
    await AsyncStorage.removeItem('user'); 
    await AsyncStorage.removeItem('code'); 
  }

  const handleJoinGame = async (code) => {
    const toSessionToken = code;
    await AsyncStorage.setItem('code', code);
    setIsLoading(true);
  
    ws.current.send(JSON.stringify({
      type: 'join',
      fromSessionToken: user.sessionToken,
      toSessionToken: toSessionToken,
    }));
  };  

  const startSurvey = () => {
    setIsLoading(true);
  
    console.log("user:"+user.sessionToken);
    console.log("joined user:"+joinedUser.userSession);  

    ws.current.send(JSON.stringify({
      type: 'startSurvey',
      fromSessionToken: user.sessionToken,
      toSessionToken: joinedUser.userSession,
    }));    
  };   

  // még nincs meghívva sehol
  const startGame = () => {
    setIsLoading(true);

    ws.current.send(JSON.stringify({
      type: 'startGame',
      fromSessionToken: user.sessionToken,
      toSessionToken: joinedUser.userSession,
    }));    
  };   

  // INIT
  useEffect(() => {
    const checkSessions = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        setLoggedIn(true);
      }
    };
    checkSessions();
  }, []);

  // WEBSOCKET
  useEffect(() => {
    
    if (loggedIn) {
      const userId = user.userId;      
      // WebSocket kapcsolat létesítése
      ws.current = new WebSocket(`ws://${devHost}:8080`);

      ws.current.onopen = () => {
        console.log('Connected to WS server');      
        ws.current.send(JSON.stringify({ type: 'hello', userId }));        
      };

      ws.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'welcome') 
        {
          const userData = { ...user }; // A user klónozása
          userData.sessionToken = data.sessionToken;
          setUser(userData);  // Frissítsd a user-t
          
          // AsyncStorage mentés az új állapot szerint
          await AsyncStorage.setItem('user', JSON.stringify(userData));
  
          const code = await AsyncStorage.getItem('code');          
          if (code && !joinedUser) {
            handleJoinGame(code);
          }        
        }         
        else if (data.type === 'join') 
        {              
            setJoinedUser( data.joinedUser );
            setGameReady( data.direction );
            setIsLoading(false);
            console.log('Message from WS server (join):', data.message);                 
        } 
        else if (data.type === 'refreshJoinedPlayer') 
        {              
              setJoinedUser( data.joinedUser );
              console.log('Message from WS server (refreshJoinedPlayer):', data.message);                        
        }
        else if (data.type === 'startSurvey') 
          {
              console.log('Message from WS server (start):', data.message);
              setGameReady('survey');
          }                  
        else if (data.type === 'notification') 
        {
          console.log('Message from WS server (notification):', data.message);
        }                 
        else if (data.type === 'ack')
        {
          setIsLoading(false);
        }
      };

      ws.current.onclose = () => {
        console.log('Disconnected from WS server');
      };      
    } else if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

  }, [loggedIn]); // A függvény csak akkor fut, ha a loggedIn állapot változik

  return (
    <AuthContext.Provider value={{ platformdata, user, joinedUser, loggedIn, logIn, logOut, ws, isLoading, setIsLoading, gameReady, handleJoinGame, setJoinedUser, setGameReady, startSurvey }}>
      {children}
    </AuthContext.Provider>
  );
}

// Egyedi hook a könnyebb eléréshez
export function useAuth() {
  return useContext(AuthContext);
}

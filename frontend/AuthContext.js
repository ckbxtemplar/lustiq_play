import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const platform = Platform.OS === 'web' ? 'web' : 'mobile';
  const devHost = 'api.play.lustiq.eu';
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const heartbeatInterval = useRef(null);

  const [platformdata] = useState({ platform, devHost });
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [joinedUser, setJoinedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameReady, setGameReady] = useState(false);
  const [opponentStatus, setOpponentStatus] = useState('pending');
  const [gameProps, setGameProps] = useState({});

  const logIn = async (userData) => {
    setUser(userData);
    setLoggedIn(true);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logOut = async () => {
		if (ws.current) {
			ws.current.onclose = null; // Töröljük az onclose eventet, hogy ne próbáljon újracsatlakozni
			ws.current.close();
			ws.current = null;
		}
		clearTimeout(reconnectTimeout.current);
		clearInterval(heartbeatInterval.current);
	
		setUser(null);
		setJoinedUser(null);
		setLoggedIn(false);
		await AsyncStorage.removeItem('user');
		await AsyncStorage.removeItem('code');
  };

  const handleJoinGame = async (code) => {
    await AsyncStorage.setItem('code', code);
    setIsLoading(true);

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'join',
          fromSessionToken: user.sessionToken,
          toSessionToken: code,
        })
      );
    }
  };

  const startGame = () => {
    setIsLoading(true);
    setGameReady('readyToPlay');

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'readyToPlay',
          fromSessionToken: user.sessionToken,
          toSessionToken: joinedUser?.userSession,
        })
      );
    }
  };

  const readyToNextQuestion = () => {
    setIsLoading(true);
    setGameReady('readyToNextQuestion');

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'readyToNextQuestion',
          fromSessionToken: user.sessionToken,
          toSessionToken: joinedUser?.userSession,
        })
      );
    }
  };

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

  const connectWebSocket = () => {
    if (!loggedIn || !user?.userId) return;

		if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
			console.log('WebSocket already open, skipping new connection.');
			return;
		}

    ws.current = new WebSocket(`wss://${devHost}/wss/`);

		ws.current.onopen = () => {
			console.log('Connected to WS server');
			ws.current.send(JSON.stringify({ type: 'hello', userId: user.userId }));
	
			clearInterval(heartbeatInterval.current);
			heartbeatInterval.current = setInterval(() => {
				if (ws.current?.readyState === WebSocket.OPEN) {
					ws.current.send(JSON.stringify({ type: 'ping' }));
				}
			}, 10000);
		};

    ws.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'welcome') {
        const updatedUser = { ...user, sessionToken: data.sessionToken };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

        const code = await AsyncStorage.getItem('code');
        if (code && !joinedUser) {
          handleJoinGame(code);
        }
      } else if (data.type === 'join') {
        setJoinedUser(data.joinedUser);
        setGameReady(data.direction);
        setIsLoading(false);
        setGameProps((prevProps) => ({ ...prevProps, room: data.room }));
      } else if (data.type === 'readyToPlay') {
        setOpponentStatus('readyToPlay');
      } else if (data.type === 'readyToNextQuestion') {
        setOpponentStatus('readyToNextQuestion');
      } else if (data.type === 'ack') {
        setIsLoading(false);
      }
    };

		ws.current.onclose = () => {
			console.log('Disconnected from WS server');
			clearInterval(heartbeatInterval.current);
	
			if (loggedIn) {
				reconnectTimeout.current = setTimeout(connectWebSocket, 2000);
			}
		};
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      clearTimeout(reconnectTimeout.current);
      clearInterval(heartbeatInterval.current);
    };
  }, [loggedIn]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && ws.current?.readyState !== WebSocket.OPEN) {
        console.log('App became active, reconnecting WebSocket...');
        connectWebSocket();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        platformdata,
        user,
        joinedUser,
        loggedIn,
        logIn,
        logOut,
        ws,
        isLoading,
        setIsLoading,
        gameReady,
        handleJoinGame,
        setJoinedUser,
        setGameReady,
        startGame,
        opponentStatus,
        setOpponentStatus,
        gameProps,
        setGameProps,
        readyToNextQuestion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

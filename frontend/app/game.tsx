import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect  } from 'expo-router';
import Footer from '../components/Footer';
import globalStyles from '../styles/styles';

const GameScreen = () => {
  const { loggedIn } = useAuth();    

  if (!loggedIn) {
    return <Redirect href={'/login'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  } 

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.container}>
        <Text>Game</Text>
      </View>
      <Footer />  
    </View>
  );
};

export default GameScreen;

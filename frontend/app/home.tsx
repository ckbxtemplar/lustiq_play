import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect  } from 'expo-router';
import Footer from '../components/Footer';
import globalStyles from '../styles/styles';

const HomeScreen = () => {
  const { loggedIn, user, gameReady } = useAuth(); 

  if (!loggedIn || !user?.sessionToken ) {
    return <Redirect href={'/login'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  } 
  else if (gameReady === "game") {
    return <Redirect href={'/game'} />;
  }  
  else {
    return <Redirect href={'/lobby'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  }

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.bodyContainer}>
        <Text>home</Text>
        <Footer />  
      </View>
    </View>           
  );
};

export default HomeScreen;

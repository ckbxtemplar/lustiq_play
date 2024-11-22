import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect  } from 'expo-router';
import Footer from '../components/Footer';
import FourDigitInput from '../components/FourDigitInput';
import LustiqButton from '../components/LustiqButton';
import globalStyles from '../styles/styles';
import ImageLogo from '../components/ImageLogo';
import { COLORS,RADIUS,FONT_SIZES } from '../styles/constants';

const HomeScreen = () => {
  const { loggedIn, gameReady } = useAuth(); 

  if (gameReady === "game") {
    return <Redirect href={'/game'} />;
  }

  if (!loggedIn) {
    return <Redirect href={'/login'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  }  else {
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

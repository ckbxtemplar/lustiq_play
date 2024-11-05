import React, { useEffect } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../AuthContext';
import Footer from '../components/Footer';
import globalStyles from '../styles/styles';

const HomeScreen = () => {
  const router = useRouter();
  const { platformdata, user, loggedIn, logOut } = useAuth();

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.container}>
        <Text>Üdv</Text>
      </View>
      <Footer />  
    </View>
  );
};

console.log('https://lustiq.eu');
export default HomeScreen;

import React, {useState} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect  } from 'expo-router';
import Footer from '../components/Footer';
import FourDigitInput from '../components/FourDigitInput';
import globalStyles from '../styles/styles';
import ImageLogo from '../components/ImageLogo';
import { COLORS,RADIUS,FONT_SIZES } from '../styles/constants';

const HomeScreen = () => {
  const { loggedIn, user, isLoading, handleJoinGame } = useAuth();
  if (!loggedIn) {
    return <Redirect href={'/login'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  } 

  const handleComplete = (code: string) => {
    handleJoinGame(code);
  };

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.bodyContainer}>
        <View style={styles.container}>
          <ImageLogo variant='light'/>        
          <View style={styles.topBox}>
            <Text>Your ID number for the pairing</Text>
            <Text style={{color:'white', letterSpacing:10, fontWeight:700, fontSize:FONT_SIZES.large}}>{ user.sessionToken ? user.sessionToken : ''  }</Text>
          </View>
          <View style={styles.circle}><Text style={{fontSize:FONT_SIZES.small}}>OR</Text></View>
          <View style={styles.bottomBox}>
            <View style={{ padding: 20 }}>            
              <FourDigitInput onComplete={handleComplete} />          
            </View>           
          </View>
          <ImageLogo variant='icon' shouldRotate={ isLoading }/>  
        </View>
        <Footer />  
      </View>
    </View>          
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%'    
  },
  topBox: {
    width: '100%',
    backgroundColor: COLORS.secondary.background,
    borderRadius: RADIUS.medium,
    paddingVertical:30,
    marginBottom:10,
    alignItems:'center'
  },
  bottomBox: {
    alignItems:'center',    
    width: '100%',
    backgroundColor: COLORS.secondary.background,
    borderRadius: RADIUS.medium,
    paddingVertical:30,
    marginTop:-30
  },
  circle: {
    alignItems:'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.secondary.background,
    marginTop:-35,
    zIndex:2,
    borderWidth:5,
    borderColor:COLORS.primary.background
  },
});

export default HomeScreen;

import React, {useState} from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect  } from 'expo-router';
import Footer from '../components/Footer';
import HorizontalStepper from '../components/HorizontalStepper';
import ImageLogo from '../components/ImageLogo';
import { COLORS,RADIUS,FONT_SIZES } from '../styles/constants';
import globalStyles from '../styles/styles';

const GameScreen = () => {
  const { loggedIn, isLoading } = useAuth();
  const [totalSteps, setTotalSteps] = useState<number>(7);

  if (!loggedIn) {
    return <Redirect href={'/login'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  } 

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.bodyContainer}>
        
        <View style={styles.container}>
          <HorizontalStepper totalSteps={totalSteps} />
          <ImageLogo variant='icon' shouldRotate={ isLoading }/>  
        </View>        
        <Footer />  

      </View>
    </View>          
  );
}

const styles = StyleSheet.create({
  background: {
    justifyContent: 'flex-start', // Elemek igazítása a felső részhez
    alignItems: 'flex-start',
    height:150,
    marginBottom:30,
    position:'absolute',
    left:-40
  },  
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
    marginTop:-30,
    paddingBottom:30
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

export default GameScreen;

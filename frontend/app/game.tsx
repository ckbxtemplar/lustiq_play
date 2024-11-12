import React, {useState, useRef, useEffect} from 'react';
import { View, StyleSheet, Text, Animated, Image } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect  } from 'expo-router';
import Footer from '../components/Footer';
import HorizontalStepper from '../components/HorizontalStepper';
import Card from '../components/Card';
import RadioSelect from '../components/RadioSelect';
import ImageLogo from '../components/ImageLogo';
import { FONT_SIZES } from '../styles/constants';
import globalStyles from '../styles/styles';

const GameScreen = ({  }) => {
  const { loggedIn, isLoading, joinedUser } = useAuth();
  const [totalSteps, setTotalSteps] = useState<number>(7);
  const options = [
    { label: 'Első opció', value: 'first' },
    { label: 'Második opció', value: 'second' },
    { label: 'Egyedi opció', value: 'custom' },
  ];
  const [welcomeMsg, setWelcomeMsg] = useState(true); 
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animáció: opacitás felfutás 1 másodperc alatt, majd várakozás és eltűnés
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.delay(2100), // 2 másodpercig marad látható
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.delay(500),
    ]).start(() => {
      // Animáció végén meghívódik a megadott függvény
      console.log('vége');
      setWelcomeMsg(false);
    });
  }, [opacity]);

  if (!loggedIn) {
    return <Redirect href={'/login'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  } 

  const handleSelect = (value: string) => {
    // mi már válaszoltunk

  };

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.bodyContainer}>
        
        <View style={styles.container}>
          <HorizontalStepper totalSteps={totalSteps} />
          { welcomeMsg ? (
          <Animated.View style={[styles.animatedBox, { opacity }]}>
            <>
              <Image 
                source={require('../assets/images/lustiq_start_game.png')} // Helyettesítsd a kép útvonalával
                resizeMode="contain" // Ezzel a kép lefedi az egész nézetet
                />              
              <Text style={{fontSize:FONT_SIZES.large, color:'white', marginTop:40 }}>Kezdődjön a játék</Text>
            </>
          </Animated.View>
          ) : (
            <View style={styles.container}>
              <Card 
                title="Kártya címe"
                description="Ez egy leírás, amely elmagyarázza a kártya tartalmát."
              />
              <RadioSelect options={options} onSelect={handleSelect} />
            </View>
          ) }             
          <ImageLogo variant='icon' shouldRotate={ isLoading }/>  
        </View>           
        <Footer />  

      </View>
    </View>          
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%'    
  },
  animatedBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%'
  }  
});

export default GameScreen;

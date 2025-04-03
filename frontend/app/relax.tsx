import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button, View, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import globalStyles from '../styles/styles';
import ImageLogo from '../components/ImageLogo';
import Footer from '../components/Footer';
import LustiqButton from '../components/LustiqButton';
import { COLORS,RADIUS,FONT_SIZES } from '../styles/constants';
import { Redirect, useRouter  } from 'expo-router';

export default function App() {
  const { user, isLoading, gameProps, joinedUser } = useAuth();     
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0); // Lejátszott idő milliszekundumban
  const [duration, setDuration] = useState(0); // Hang hossza milliszekundumban
	const [message, setMessage] = useState<React.ReactNode>(null);

  async function playSound() {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
      return;
    }
  
    // Hangfájlok objektuma
    const soundFiles: { [key: number]: any } = {
      1: require('../assets/kozos_legzesgyakorlat_v2.mp3'),
      2: require('../assets/kozos_legzesgyakorlat_v2.mp3'),
      3: require('../assets/kozos_legzesgyakorlat_v2.mp3'),
    };
  
    const selectedSound = soundFiles[gameProps.level];
    if (!selectedSound) {
      console.error(`Invalid level: ${gameProps.level}`);
      return;
    }
  
    // Új hang betöltése a kiválasztott fájl alapján
    const { sound: newSound } = await Audio.Sound.createAsync(selectedSound);
    setSound(newSound);
  
    newSound.setOnPlaybackStatusUpdate(updateStatus);
    console.log(`Lejátszás kezdése a(z) ${gameProps.level} szinthez tartozó hangfájllal`);
    await newSound.playAsync();
    setIsPlaying(true);
  }

  const updateStatus = (status: Audio.SoundStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
    }

    if (status.didJustFinish) {
      setIsPlaying(false);
      setMessage(<><Text style={{color:'white', textAlign:'center', marginTop:20, fontSize: 16}}>Köszönjük, hogy végigmentetek a kérdéseken és a relaxáción!</Text><Text style={{color:'white', textAlign:'center', marginTop:10, marginBottom:20}}>Gratulálunk, hogy tettetek a közös szexuális életetek fejlesztéséért!</Text></>);
    }
  };

  const handleSliderChange = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          console.log('Lejátszás leállítása');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

	if (!joinedUser || !user?.sessionToken) {
		return <Redirect href={'/lobby'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
	}  

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.bodyContainer}>       
        <View style={styles.container}>
          <View style={styles.topBox}>
            <Text style={{color:'white', textAlign:'center', fontSize: 16, marginBottom:20}}>A következő percekben egy vezetett relaxáció vár rátok. Ez a gyakorlat segít lelassulni, nyugalmat találni egymás mellett, és teljes figyelmeteket egymásra és az előttetek álló élményre irányítani. Érezni fogjátok, milyen jó együtt lenni, miközben a testetek összehangolódik. A relaxáció végére könnyedebben és felszabadultabban fordulhattok egymás felé.</Text>
            <LustiqButton title={isPlaying ? 'Szünet' : 'Lejátszás'} onPress={playSound} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onValueChange={handleSliderChange}
              minimumTrackTintColor={COLORS.primary.background}
              maximumTrackTintColor="#000000"      
              thumbTintColor={COLORS.primary.background}   
            />
            <Text>
              {formatTime(position)} / {formatTime(duration) }
            </Text> 
						{message}
          </View>
          <ImageLogo variant='icon' shouldRotate={ isLoading }/>
        </View>           
        <Footer />
      </View>        
    </View>
  );
}

const formatTime = (millis: number) => {
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
    alignItems:'center',
    padding:20
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 10,
  },
});
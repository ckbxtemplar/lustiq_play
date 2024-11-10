import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import LustiqLogoLight from '../assets/images/Lustiq_logo_light.svg';
import LustiqLogoDark from '../assets/images/Lustiq_logo.svg';
import LustiqLogoIsotype from '../assets/images/Lustiq_Isotype.svg';

export default function CenteredImage({ variant = 'dark', shouldRotate = false }) {
  let LogoComponent = null;
  let logoStyle = { width: 250 }; // Alapértelmezett logó méret
  switch (variant) {
    case 'dark':
      LogoComponent = LustiqLogoDark;
      break;
    case 'icon':
      LogoComponent = LustiqLogoIsotype;
      logoStyle = { width: 28 };
      break;
    default:
      LogoComponent = LustiqLogoLight;
      break;
  }

  const rotation = useRef(new Animated.Value(0)).current; // Kezdeti érték 0
  const isAnimating = useRef(false); // Tartsuk nyilván, hogy éppen animálunk-e

  const startRotation = () => {
    if (!shouldRotate){ return;} // Ha már animálunk, ne kezdjük el újra

    const options = {
      toValue: 1, // A célérték 1 lesz, 360 fok
      duration: 2000, // Animáció időtartama
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // Weben biztosan false
    };

    // A forgás folyamatosan fog ismétlődni, ha `shouldRotate` igaz
    Animated.timing(rotation, options).start(() => {
      // Az animáció befejeztével ellenőrizzük, hogy folytatni kell-e
      if (shouldRotate) {
        rotation.setValue(0); // Visszaállítjuk 0-ra, hogy újra kezdődjön
        // startRotation(); // Újraindítjuk az animációt
      } else {
        isAnimating.current = true; // Ha már nem kell pörögni, leállítjuk az animációt
      }
    });
  };

  const stopRotation = () => {
    // Ha az animáció fut, akkor megállítjuk
    if (isAnimating.current) {
      rotation.stopAnimation(); // Leállítjuk az animációt
      isAnimating.current = false; // Leállítjuk az animációs állapotot
    }
  };

  useEffect(() => {
    if (shouldRotate) {
      startRotation(); // Ha igaz, elindítjuk a forgást
    } else {
      stopRotation(); // Ha hamis, leállítjuk a forgást
    }
  }, [shouldRotate]); // Figyeljük a shouldRotate változását

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], // A 0-tól 360-ig terjedő forgás
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
        <LogoComponent style={logoStyle} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
});

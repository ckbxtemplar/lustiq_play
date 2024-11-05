import React from 'react';
import { View, StyleSheet } from 'react-native';
import LustiqLogoLight from '../assets/images/Lustiq_logo_light.svg';
import LustiqLogoDark from '../assets/images/Lustiq_logo.svg';

export default function CenteredImage({ variant = 'dark' }) {
  const LogoComponent = variant === 'dark' ? LustiqLogoDark : LustiqLogoLight;

  return (
    <View style={styles.container}>
      <LogoComponent style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:30,
        marginBottom:30
    },
    logo: {
        width: 250
    },
  });
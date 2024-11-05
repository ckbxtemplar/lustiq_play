import React from 'react';
import { View, StyleSheet } from 'react-native';
import SvgLogo from '../assets/images/Lustiq_logo.svg';

export default function CenteredImage() {
  return (
    <View style={styles.container}>
      <SvgLogo style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 250
    },
  });
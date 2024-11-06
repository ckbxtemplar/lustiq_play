import React from 'react';
import { View, StyleSheet } from 'react-native';
import LustiqLogoLight from '../assets/images/Lustiq_logo_light.svg';
import LustiqLogoDark from '../assets/images/Lustiq_logo.svg';
import LustiqLogoIsotype from '../assets/images/Lustiq_Isotype.svg';

export default function CenteredImage({ variant = 'dark' }) {
  let LogoComponent = null;
  let logoStyle = null;
  switch (variant){
    case 'dark':
      LogoComponent = LustiqLogoDark; 
      logoStyle = {width:250};
      break;
    case 'icon':
      LogoComponent = LustiqLogoIsotype; 
      logoStyle = {width:28};      
      break;    
    default:
      LogoComponent = LustiqLogoLight; 
      logoStyle = {width:250};      
  }

  return (
    <View style={styles.container}>
      <LogoComponent style={logoStyle} />
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
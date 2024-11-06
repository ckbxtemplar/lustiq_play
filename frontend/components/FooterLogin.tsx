import React from 'react';
import { View, Text, Pressable, StyleSheet  } from 'react-native';
import { Platform } from 'react-native';
import { useAuth } from '../AuthContext';
import Octicons from '@expo/vector-icons/Octicons';
import globalStyles from '../styles/styles';

const FooterLogin = () => {
  const { loggedIn, user, logOut } = useAuth();
  const platformIconName = (Platform.OS === 'web' ? 'device-desktop' : 'device-mobile');
  return (
    <View style={styles.footerContainer}>
      <View style={styles.leftContainer}>
        {loggedIn ? (            
            <>
            <Pressable onPress={logOut} style={{marginRight:20}}><Octicons name="sign-out" size={24} color="black"  style={globalStyles.colorPrimary}/></Pressable>            
            <Text style={globalStyles.colorPrimary}>Be vagy jelentkezve <Text style={{fontWeight:'bold'}}>{user.username}</Text> !</Text>            
            </>
        ) : (
          <Text style={globalStyles.colorPrimary}>Nincs bejelentkezve</Text>
        )}
      </View>
      <View style={styles.rightContainer}>
        <Octicons name={platformIconName} size={24} style={globalStyles.colorPrimary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    footerContainer: {
      flexDirection: 'row', // Bal és jobb oldal elrendezés
      justifyContent: 'space-between', // Térköz a bal és jobb oldali tartalom között
      padding: 30,
      marginTop: 'auto',
      backgroundColor: '#600F13'
    },
    leftContainer: {
      flex: 1, // Bal oldal kitöltése
      flexDirection: 'row',
      alignItems: 'center',      
    },
    rightContainer: {
      justifyContent: 'center', // Jobb oldal középre igazítás
      alignItems: 'flex-end', // Jobb oldal tartalmának igazítása
    },
  });

export default FooterLogin;
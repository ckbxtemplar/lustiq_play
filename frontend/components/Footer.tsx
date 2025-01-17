import React from 'react';
import { View, Text, Pressable, StyleSheet  } from 'react-native';
import { Platform } from 'react-native';
import { useAuth } from '../AuthContext';
import Octicons from '@expo/vector-icons/Octicons';
import globalStyles from '../styles/styles';
import { COLORS, FONT_SIZES } from '../styles/constants';
import BinaryImageComponent from './ImageAvatar';
 
const Footer = () => {
  const { loggedIn, user, joinedUser, logOut } = useAuth();
  const platformIconName = (Platform.OS === 'web' ? 'device-desktop' : 'device-mobile');  
  return (
    <View style={styles.footerContainer}>
      <View style={styles.leftContainer}>
      { loggedIn && (
        <>          
          { user?.avatar && (
            <BinaryImageComponent base64Image={user.avatar} isEditable={true} />
          )}            
          { joinedUser?.avatar && (
            <BinaryImageComponent base64Image={joinedUser.avatar} isEditable={false} />
          )}
          { user?.username && (
            <Text style={{fontSize:FONT_SIZES.small, marginLeft:8, color:'white'}}>{user.username}</Text>
          )}            
          { joinedUser?.username && (
            <Text style={{fontSize:FONT_SIZES.small, color:'white'}}> & {joinedUser.username}</Text>
          )}
        </>
      )}
      </View>
      <View style={styles.midContainer}>       

      </View>      
      <View style={styles.rightContainer}>
        <Octicons name={platformIconName} size={22} style={[globalStyles.colorSecondary, {marginHorizontal:4}]} />
        <Pressable onPress={logOut}><Octicons name="sign-out" size={22} style={[globalStyles.colorSecondary, {marginHorizontal:4}]}/></Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    footerContainer: {
      flexDirection: 'row', // Bal és jobb oldal elrendezés
      justifyContent: 'space-between', // Térköz a bal és jobb oldali tartalom között
      padding: 20,
      borderRadius:14,
      borderWidth:0,      
      marginTop: 'auto',
      backgroundColor: COLORS.secondary.background,
      color: 'COLORS.secondary.text',
      alignSelf: 'center',
      width: '100%',
      maxWidth: 500,         
      
    },
    leftContainer: {
      flex: 1, // Bal oldal kitöltése
      flexDirection: 'row',
      alignSelf: 'center',
      alignItems:'center',
      justifyContent: 'flex-start',            
    },
    midContainer: {
      alignSelf: 'center',
      alignItems:'center',
      justifyContent: 'center',   
      paddingHorizontal:20,
    }, 
    rightContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
      alignItems:'center',
      justifyContent: 'flex-end',
    },
  });

export default Footer;
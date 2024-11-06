import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect  } from 'expo-router';
import Footer from '../components/Footer';
import globalStyles from '../styles/styles';
import ImageLogo from '../components/ImageLogo';
import { COLORS,RADIUS,FONT_SIZES } from '../styles/constants';

const HomeScreen = () => {
  const { loggedIn, serverMessage, user, ws } = useAuth();       

  if (!loggedIn) {
    return <Redirect href={'/login'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  } 

  const handleJoinGame = () => {
    const bSessionToken = 'e47d6'; // B játékos session tokenje
    if (ws.current && user) {
      ws.current.send(JSON.stringify({
        type: 'join',
        fromUserId: user.userId,
        toSessionToken: bSessionToken,
      }));

      console.log(`Sent join request from ${user.userId} to ${bSessionToken}`);
    }
  };  

  return (
    <View style={globalStyles.body}>
      <View style={styles.container}>
        <ImageLogo variant='light'/>        
        <View style={styles.topBox}><Text>1</Text><Text>1</Text><Text>1</Text><Text>1</Text><Text>1</Text></View>
        <View style={styles.circle}><Text style={{fontSize:FONT_SIZES.small}}>OR</Text></View>
        <View style={styles.bottomBox}><Text>3</Text><Text>3</Text><Text>3</Text><Text>3</Text><Text>3</Text></View>
        <ImageLogo variant='icon'/>
        <Text>{serverMessage}</Text>
        <View style={{ padding: 20 }}>
          <Button title="Join Game" onPress={handleJoinGame} />
        </View>        
      </View>
      <Footer />  
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding:20
  },
  topBox: {
    width: '100%',
    backgroundColor: COLORS.secondary.background,
    borderRadius: RADIUS.medium,
    paddingBottom:30,
    marginBottom:10,
    alignItems:'center'
  },
  bottomBox: {
    alignItems:'center',    
    width: '100%',
    backgroundColor: COLORS.secondary.background,
    borderRadius: RADIUS.medium,
    paddingTop:30,    
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

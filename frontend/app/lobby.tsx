import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect, useRouter } from 'expo-router';
import Footer from '../components/Footer';
import FourDigitInput from '../components/FourDigitInput';
import LustiqButton from '../components/LustiqButton';
import globalStyles from '../styles/styles';
import ImageLogo from '../components/ImageLogo';
import { COLORS,RADIUS,FONT_SIZES } from '../styles/constants';

const LobbyScreen = () => {
  const router = useRouter(); 
  const { loggedIn, user, joinedUser, isLoading, handleJoinGame, setJoinedUser, gameReady, setGameReady, platformdata } = useAuth();

  const handleComplete = (code: string) => {
    handleJoinGame(code);
  };

  const resetJoin = () => {
    setJoinedUser(null);
    setGameReady(false); 
  };   

  useEffect(() => {
    if (platformdata.platform === 'web') document.title = joinedUser ? 'Lustiq Play - Connected' : 'Lustiq Play - Waiting';
  }, [joinedUser]);  

  if (!loggedIn || !user?.sessionToken) {
    return <Redirect href={'/login'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  } 

  return (   
    <View style={globalStyles.body}>      
      <View style={globalStyles.bodyContainer}>
        <View style={styles.container}>
          <ImageLogo variant='light'/>        

          <View style={styles.topBox}>
            <Text>A Te azonosítód a csatlakozáshoz</Text>
            <Text style={{color:'white', letterSpacing:10, fontWeight:700, fontSize:FONT_SIZES.large}}>{ user?.sessionToken ? user.sessionToken : ''  }</Text>
          </View>

          <View style={styles.circle}>
						<Text style={{fontSize:FONT_SIZES.small}}>VAGY</Text>
					</View>

					<View style={styles.bottomBox}>
							{joinedUser ? (
								<View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal:20 }}>
									{gameReady === "request" || gameReady === "accept"  ? (
										<View style={{ alignItems: 'center', justifyContent: 'center' }}>
											<Text style={{ marginBottom: 5, textAlign: 'center', color:COLORS.secondary.text }}>A következő 5 kérdés segít átgondolni, hogyan kommunikáltok a szexről és milyen a kapcsolatotok egymással.</Text>
											<Text style={{ marginBottom: 5, textAlign: 'center', color:COLORS.secondary.text }}><Text style={{ fontWeight:'bold' }}>Válaszolj egyedül</Text> – így mindketten olyan kérdésekkel találkoztok majd a játékban, amelyek a legjobban illenek hozzátok.</Text>
											<Text style={{ marginBottom: 8, textAlign: 'center', color:COLORS.secondary.text }}>Utána indulhat a játék!</Text>
											<LustiqButton title="Hangolódó kérdések" onPress={() => router.push('/survey')}  />
										</View>
									) : gameReady === "accept" ? (
										<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
											<Text style={{ marginRight: 8 }}>Várunk a partnerre</Text>
											<ActivityIndicator size="small" color={COLORS.secondary.text} />
										</View>
									) : gameReady === "survey" ? ( <Redirect href={'/survey'} /> )
									: null}
									
									<Text onPress={resetJoin} style={{ marginTop: 30, fontWeight: 'bold', fontSize: FONT_SIZES.small }}>Vissza</Text>
								</View>
							) : (
								<View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal:20 }}>
									<Image 
									source={require('../assets/images/lustiq_connect_bg.png')} // Helyettesítsd a kép útvonalával
									style={styles.background}
									resizeMode="contain" // Ezzel a kép lefedi az egész nézetet
									/>										
									<Text style={{ marginBottom: 10 }}>Add meg a partnered azonosítóját</Text>
									<FourDigitInput onComplete={handleComplete} />
								</View>
							)}																		
					</View>

          <ImageLogo variant='icon' shouldRotate={ isLoading }/> 

        </View>
        <Footer />  
      </View>
    </View>          
  );
};

const styles = StyleSheet.create({
  background: {
    height:130,
		marginBottom:20
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
		paddingTop:40,
    padding:30
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

export default LobbyScreen;

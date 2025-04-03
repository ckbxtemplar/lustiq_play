import React, {useState, useRef, useEffect} from 'react';
import { View, StyleSheet, Text, Animated, Image, Alert } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect, useRouter  } from 'expo-router';
import Footer from '../components/Footer';
import HorizontalStepper from '../components/HorizontalStepper';
import Card from '../components/Card';
import RadioSelect from '../components/RadioSelect';
import ImageLogo from '../components/ImageLogo';
import {COLORS, FONT_SIZES } from '../styles/constants';
import globalStyles from '../styles/styles';
import Octicons from '@expo/vector-icons/Octicons';
import axios from 'axios';
import LustiqButton from '../components/LustiqButton';

const GameScreen = ({  }) => {
  const { user, platformdata, isLoading, joinedUser, gameReady, setGameReady, opponentStatus, setOpponentStatus, gameProps, setGameProps, readyToNextQuestion } = useAuth();

  const [totalSteps, setTotalSteps] = useState<number>(7);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const devHost = platformdata.devHost;  
  type QuestionOption = {
    id: number;
    title: string;
    description: string;
    score: string;
  };
  
  type Question = {
    id: number;
    title: string;
    description: string;
    type: string;
    options?: QuestionOption[];
  };  
  const [questions, setQuestions] = useState([]); 
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [answersStatus, setanswersStatus] = useState('start');
  const [welcomeMsg, setWelcomeMsg] = useState('start');
	const [buttonMessage, setButtonMessage] = useState<React.ReactNode>(<Text>Tovább</Text>);
  const [disabledButton, setDisabledButton] = useState(false);
  const welcomeOpacity = useRef(new Animated.Value(0)).current;  
  const opacity = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(welcomeOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.delay(2000), // 2 másodpercig marad látható
      Animated.timing(welcomeOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.delay(300),
    ]).start(() => {
      // Animáció végén meghívódik a megadott függvény
      setWelcomeMsg('game');
    });
  }, [welcomeOpacity]);

  const hasAnimated = useRef(false);  
  useEffect(() => {
    if (gameReady === 'readyToNextQuestion' && opponentStatus === 'readyToNextQuestion' && !hasAnimated.current) {
      hasAnimated.current = true;
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }).start(() => {
        // Ha eltűnt, frissítjük az állapotokat
        const nextStep = currentStep + 1;
        if (questions[nextStep]) {
          setCurrentStep(nextStep);
          // if (questions[nextStep].type == 'talk') setButtonMessage('Várjuk {} válaszát') 
        } else {
          setWelcomeMsg('end');
        }
        setOpponentStatus('pending');
        setGameReady(false);
        setDisabledButton(false); 
				setButtonMessage(<Text>Következő lépés</Text>);       

        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }).start( () => { hasAnimated.current = false; });
        }, 300); // Késleltetés 300ms
      });
    }
  }, [gameReady, opponentStatus]);

  useEffect(() => {
    if (platformdata.platform === 'web') document.title = 'Lustiq Play - Game';
    const initialize = async () => {
      try {
        axios.post(`https://${devHost}/getQuestions`,{ room:gameProps.room })
        .then(response => {
          const minScore = response.data.score;
          const questionsData = response.data.questions;
          const updatedGameProps = { ...gameProps, level: response.data.level };
          setGameProps(updatedGameProps);   
          setQuestions(questionsData);        
          setTotalSteps(Object.keys(questionsData).length); 
        })
        .catch(err => {
          console.log(err.response || err);        
          if (platformdata.platform === 'web') {
            window.alert('Error get questions from backend');
          } else {
            Alert.alert('Error', 'Error get questions from backend');
          }           
        });        
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    initialize();
  }, []);

  const handleSelect = (value: string, parent: number) => {
    setDisabledButton(true);    
		setButtonMessage(<Text>Várunk még <Text style={{ fontWeight: 'bold' }}>{joinedUser?.username}</Text> válaszára</Text>);
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [parent]: value,
    }));
    readyToNextQuestion();
  };

  useEffect(() => {
    if (Object.keys(answers).length >= questions.length && questions.length > 0) {
     
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }).start(() => {
        setanswersStatus('end');
      });

      axios.post(`https://${devHost}/saveAnswers`, { answers: answers, userId: user.userId, room:gameProps.room })
      .then(response => {
        console.log(response.data);
      })
      .catch(err => {
        console.log(err.response || err);        
        if (platformdata.platform === 'web') {
          window.alert('Submitting the form failed.');
        } else {
          Alert.alert('Error', 'Submitting the form failed.');
        }        
      });
    }
  }, [answers]);

  if (!joinedUser || !user?.sessionToken) {
    return <Redirect href={'/lobby'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  }  

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.bodyContainer}>
        
        <View style={styles.container}>
          <HorizontalStepper totalSteps={totalSteps} currentStep={currentStep} />
          { welcomeMsg === 'start' ? (
          <Animated.View style={[styles.animatedBox, { opacity: welcomeOpacity }]}>
            <>
              <Image 
                source={require('../assets/images/lustiq_start_game.png')} // Helyettesítsd a kép útvonalával
                resizeMode="contain" // Ezzel a kép lefedi az egész nézetet
                />              
              <Text style={{fontSize:FONT_SIZES.large, color:'white', marginTop:40 }}>Kezdődjön a játék</Text>
            </>
          </Animated.View>
          ) : welcomeMsg === 'game' ? (
            <Animated.View style={[styles.animatedBox, { opacity: opacity }]}>
              <View style={styles.container}>
                { questions[currentStep] ? (
                <>
                  <Card 
                    title={questions[currentStep].title}
                    description={questions[currentStep].description}
                  />
                  <RadioSelect options={questions[currentStep].options || []} parent={questions[currentStep].id} type={questions[currentStep].type || 'unknown'} disabled={disabledButton}  buttonMessage={buttonMessage} onSelect={handleSelect} />
                </>              
                ) : (<Text>No data</Text>)}
              </View>
            </Animated.View>
          ) : welcomeMsg === 'end' ? (
            <View>            
              <View style={styles.containerEnd}>            
                <Text style={{fontSize:FONT_SIZES.large, color:COLORS.primary.text, marginTop:8, marginRight:8 }}>Eljött a TI időtök </Text>
                <Octicons name="heart" size={24} color={COLORS.primary.text} />            
              </View>
              <View style={styles.containerEnd}>            
                <View style={{ marginTop: 16 }}>
                  <LustiqButton title="Tovább a Páros relaxációhoz" onPress={() => router.push('/relax')} />
                </View>              
            </View>   
          </View>         
          ) : null }             
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
  },
  containerEnd: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,     
  }  
});

export default GameScreen;

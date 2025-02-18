import React, {useState, useRef, useEffect} from 'react';
import { View, StyleSheet, Text, Animated, Image, Alert } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect, useRouter  } from 'expo-router';
import Footer from '../components/Footer';
import HorizontalStepper from '../components/HorizontalStepper';
import Card from '../components/Card';
import RadioSelect from '../components/RadioSelect';
import ImageLogo from '../components/ImageLogo';
import { COLORS, FONT_SIZES } from '../styles/constants';
import LustiqButton from '../components/LustiqButton';
import globalStyles from '../styles/styles';
import Octicons from '@expo/vector-icons/Octicons';
import axios from 'axios';

const SurveyScreen = ({  }) => {
  const { user, isLoading, joinedUser, platformdata, startGame, gameReady, opponentStatus, gameProps } = useAuth();   
  const devHost = platformdata.devHost;
  const router = useRouter();

  const [totalSteps, setTotalSteps] = useState<number>(7);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [score, setScore] = useState<number>(0);  
  const [questions, setQuestions] = useState([]); 
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [surveyStatus, setSurveyStatus] = useState('start');
  const [buttonTitle, setbuttonTitle] = useState('Kezdhetjük!');
  
  const [buttonMessage] =  useState('Tovább');
  const [showMessage, setShowMessage] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (surveyStatus === 'start') {
      // Start fázis animáció
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.delay(1000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.delay(400),
      ]).start(() => {
        setSurveyStatus('survey'); // Tovább a következő fázisra
      });
    } else if (surveyStatus === 'survey') {
      // Survey fázis animáció
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (surveyStatus === 'end') {
      // End fázis animáció
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [surveyStatus]);

  const hasAnimated = useRef(false); 
  useEffect(() => {
    if (gameReady === 'readyToPlay' && opponentStatus === 'readyToPlay' && !hasAnimated.current) {
      hasAnimated.current = true;      
      setShowMessage(true); // Aktiválja az üzenet megjelenítését
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.delay(2500), 
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start(() => {
        hasAnimated.current = false;
        router.push('/game'); // Átirányítás az animáció után
      });
    }
    else if (gameReady === 'readyToPlay' && opponentStatus !== 'readyToPlay')
    {
      const t = `${joinedUser.username} még nem töltötte ki..`;
      setbuttonTitle(t);
    }
  }, [gameReady, opponentStatus]);

  useEffect(() => {
    if (platformdata.platform === 'web') document.title = 'Lustiq Play - Survey';
    const initialize = async () => {
      try {
        axios.post(`https://${devHost}/getSurvey`)
        .then(response => {
          const questionsData = response.data.questions;
          setQuestions(questionsData);        
          setTotalSteps(Object.keys(questionsData).length);         

        })
        .catch(err => {
          console.log(err.response || err);        
          if (platformdata.platform === 'web') {
            window.alert('Error get survey from backend');
          } else {
            Alert.alert('Error', 'Error get survey from backend');
          }          
        });        
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    initialize();
  }, []);


  const handleSelect = (value: string, parent: number) => {    
    if (value==="undefined" || !value ) {
      if (platformdata.platform === 'web') {
        window.alert('Kérjük, válaszolj a kérdésre, mielőtt továbblépsz.');
      } else {
        Alert.alert('Error', 'Kérjük, válaszolj a kérdésre, mielőtt továbblépsz.');
      }              
      return;
    }

    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [parent]: value,
    }));

    const nextStep = currentStep + 1;
    if (questions[nextStep]){
      setCurrentStep(nextStep);
    }
  };

  useEffect(() => {
    if (Object.keys(answers).length >= questions.length && questions.length > 0) {
 
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }).start(() => {
        setSurveyStatus('end');
      });

      
      const totalScore = calculateTotalScore(questions,answers);
      setScore(totalScore);
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

  const calculateTotalScore = (questions, answers) => {
    let totalScore = 0;
  
    // Iterate through the answers
    for (const questionId in answers) {
      const selectedOptionId = answers[questionId];
  
      const question = questions.find(q => q.id === parseInt(questionId, 10));
      if (!question) continue;

      const selectedOption = question.options.find(option => option.id === parseInt(selectedOptionId,10));
      if (!selectedOption) continue;

      const sc = parseInt(selectedOption.score, 10); // Convert score to a number
      if (!isNaN(sc)) {
        totalScore += sc;
      }
    }
  
    return totalScore;
  };

  if (!joinedUser || !user?.sessionToken) {
    return <Redirect href={'/lobby'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  }      

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.bodyContainer}>
        
        <View style={styles.container}>
          <HorizontalStepper totalSteps={totalSteps} currentStep={currentStep} />
          { surveyStatus === 'start' ? (
          <Animated.View style={[styles.animatedBox, { opacity }]}>
            <>
              <Image 
                source={require('../assets/images/lustiq_start_game.png')} // Helyettesítsd a kép útvonalával
                style={styles.image}
								resizeMode="contain"
                />              
              <Text style={{fontSize:FONT_SIZES.large, color:'white', marginTop:40 }}>Az egyensúly megtalálása</Text>
              <Text style={{fontSize:FONT_SIZES.small, color:COLORS.primary.text, marginTop:8 }}>FELMÉRÉS</Text>
            </>
          </Animated.View>
          ) : surveyStatus === 'survey' ? (
            <Animated.View style={[styles.animatedBox, { opacity }]}>            
              <View style={styles.container}>
                { questions[currentStep] ? (
                <>
                  <Card 
                    title={questions[currentStep].title}
                    description={questions[currentStep].description}
                  />
                  <RadioSelect options={questions[currentStep].options || []} parent={questions[currentStep].id} buttonMessage={buttonMessage} onSelect={handleSelect} />
                </>              
                  ) : (<Text>No data</Text>)}
              </View>
            </Animated.View>            
          ) : surveyStatus === 'end' ? (
            <Animated.View style={[styles.animatedBox, { opacity }]}>
            <>
              <Image 
                source={require('../assets/images/lustiq_start_game.png')} // Helyettesítsd a kép útvonalával
                style={styles.image}
								resizeMode="contain"								
                />              
              <Text style={{fontSize:FONT_SIZES.large, color:'white', marginTop:40, marginBottom:10, textAlign:'center' }}>Köszönjük a válaszokat!</Text>
              <Text style={{fontSize:FONT_SIZES.small, color:'white', marginTop:20, marginBottom:10, textAlign:'center' }}>Kattints a gombra, ha készen állsz az élményre.</Text>              
              { !showMessage ? (                
                <LustiqButton title={buttonTitle} onPress={startGame}  />        
              ):(
                <Animated.View style={{ opacity }}>
                  <View style={styles.containerStart}>
                    <Text style={{fontSize:FONT_SIZES.small, color:COLORS.primary.text, marginTop:8, marginRight:8 }}>Kezdhetjük...</Text>
                    <Octicons name="code-of-conduct" size={24} color={COLORS.primary.text} />
                  </View>
                </Animated.View>
              )}
            </>
            </Animated.View>              
          ) : null 
          }             
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
  containerStart:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,       
  },
	image:{
    height:200,
		marginBottom:20		
	}
});

export default SurveyScreen;

import React, {useState, useRef, useEffect} from 'react';
import { View, StyleSheet, Text, Animated, Image, Alert } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect  } from 'expo-router';
import Footer from '../components/Footer';
import HorizontalStepper from '../components/HorizontalStepper';
import Card from '../components/Card';
import RadioSelect from '../components/RadioSelect';
import ImageLogo from '../components/ImageLogo';
import { COLORS, FONT_SIZES } from '../styles/constants';
import globalStyles from '../styles/styles';
import axios from 'axios';

const SurveyScreen = ({  }) => {
  const { user, isLoading, joinedUser, platformdata } = useAuth();   
  const devHost = platformdata.devHost;

  const [totalSteps, setTotalSteps] = useState<number>(7);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [questions, setQuestions] = useState([]); 
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [welcomeMsg, setWelcomeMsg] = useState(true);
  const [buttonMessage, setButtonMessage] =  useState('Tovább');
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animáció: opacitás felfutás 1 másodperc alatt, majd várakozás és eltűnés
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.delay(2100), // 2 másodpercig marad látható
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.delay(500),
    ]).start(() => {
      // Animáció végén meghívódik a megadott függvény
      setWelcomeMsg(false);
    });
  }, [opacity]);

  useEffect(() => {
    const initialize = async () => {
      try {
        axios.post(`http://${devHost}:3000/getSurvey`)
        .then(response => {
          const questionsData = response.data.questions;
          setQuestions(questionsData);        
          setTotalSteps(Object.keys(questionsData).length);         

        })
        .catch(err => {
          console.log(err.response || err);        
          Alert.alert('Error', 'Error get survey from backend');
        });        
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    initialize();
  }, []);


  const handleSelect = (value: string, parent: number) => {    
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
      const wm = `Várunk ${joinedUser.username} válaszára...`;    
      setButtonMessage(wm);
      
      const score = calculateTotalScore(questions,answers);
      console.log('score:', score);
      console.log('Menthető válaszok:', answers);

      axios.post(`http://${devHost}:3000/saveSurvey`, { answers: answers, userId: user.userId })
      .then(response => {
        console.log(response.data);
      })
      .catch(err => {
        console.log(err.response || err);        
        Alert.alert('Error', 'Submitting the form failed.');
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

      const score = parseInt(selectedOption.score, 10); // Convert score to a number
      if (!isNaN(score)) {
        totalScore += score;
      }
    }
  
    return totalScore;
  };

  if (!joinedUser) {
    return <Redirect href={'/lobby'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  }      

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.bodyContainer}>
        
        <View style={styles.container}>
          <HorizontalStepper totalSteps={totalSteps} currentStep={currentStep} />
          { welcomeMsg ? (
          <Animated.View style={[styles.animatedBox, { opacity }]}>
            <>
              <Image 
                source={require('../assets/images/lustiq_start_game.png')} // Helyettesítsd a kép útvonalával
                resizeMode="contain" // Ezzel a kép lefedi az egész nézetet
                />              
              <Text style={{fontSize:FONT_SIZES.large, color:'white', marginTop:40 }}>A kaland egyensúlya</Text>
              <Text style={{fontSize:FONT_SIZES.small, color:COLORS.primary.text, marginTop:8 }}>FELMÉRÉS</Text>
            </>
          </Animated.View>
          ) : (
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
          ) }             
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
  }  
});

export default SurveyScreen;

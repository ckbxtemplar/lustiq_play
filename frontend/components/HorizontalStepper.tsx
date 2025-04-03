import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../styles/constants';

// Definiáljuk a prop típusokat a komponenshez
interface HorizontalStepperProps {
  totalSteps: number; // A teljes lépések száma
  currentStep: number;
}

const HorizontalStepper: React.FC<HorizontalStepperProps> = ({ totalSteps, currentStep = 0 }) => {

  const [stepData] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ,20]); // Lépések adatai (dinamikusan változtatható)

  return (
    <View style={styles.container}>
      <View style={styles.stepperContainer}>
        {stepData.slice(0, totalSteps).map((step, index) => (
          <View
            key={index}
            style={[
              styles.step,
              index === currentStep && styles.activeStep,
              index < currentStep && styles.completedStep,
            ]}
          >
            <Text style={styles.stepText}>{index + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    width:'100%',    
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width:'100%',
    marginBottom: 20,
  },
  step: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    opacity: 0.5
  },
  activeStep: {
    opacity: 1,   
    backgroundColor: COLORS.secondary.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Android árnyék
    elevation: 4,    
  },
  completedStep: {
    opacity: 1,    
    backgroundColor: COLORS.primary.text,
  },
  stepText: {
    color: COLORS.accent.background,
    fontWeight: 'bold',
		fontSize: 10,
  }
});

export default HorizontalStepper;

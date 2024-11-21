import React, {useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { COLORS,RADIUS,FONT_SIZES } from '../styles/constants';

interface CardProps {
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ title, description }) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Az animáció futtatása 1 másodperc alatt
        Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        }).start();
    }, [opacity]);

    return (
        <Animated.View style={[styles.card, { opacity }]}>
          <>
            { title && <Text style={styles.title}>{title}</Text> }
            { description && <Text style={styles.description}>{description}</Text> }
          </>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.secondary.background,
    borderRadius: RADIUS.small,
    padding: 20,
    margin: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    width:'100%'
  },
  title: {
    color:COLORS.secondary.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: 'white',
  },
});

export default Card;

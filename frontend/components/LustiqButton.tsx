import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';

interface ButtonProps {
    onPress?: () => void;
    title?: React.ReactNode;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
}

export default function Button(props: ButtonProps) {
  const { onPress, title = 'Save', disabled= false, variant = 'primary' } = props;

  const buttonStyles = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary
  } as const;
 
  const textStyles = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary
  } as const;  

  const buttonStyle = buttonStyles[variant];
  const textStyle = textStyles[variant];

  return (
    <Pressable style={[buttonStyle, disabled && { opacity: 0.5 }]} disabled={disabled} onPress={disabled ? undefined : onPress}>
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

const styles = StyleSheet.create({
  buttonPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    elevation: 3,
    backgroundColor: 'white',
    borderWidth: 0,    

  },
  buttonSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    elevation: 3,
    backgroundColor: '#FA2243',
    borderWidth: 1,
    borderColor: 'white'
  },
  textPrimary: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: 0.25,
    color: '#600F13',
  },
  textSecondary: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: 0.25,
    color: 'white',
  },  
});
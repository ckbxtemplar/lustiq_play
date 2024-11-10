import React, { useRef, useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { COLORS,RADIUS,FONT_SIZES } from '../styles/constants';

type FourDigitInputProps = {
    onComplete: (code: string) => void; // onComplete típusának meghatározása
};

const FourDigitInput: React.FC<FourDigitInputProps> = ({ onComplete }) => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;

    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.every(char => char !== '') && onComplete) {
      onComplete(newCode.join(''));
    }
  };

  const handleBackspace = (text: string, index: number) => {
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          style={styles.input}
          maxLength={1}
          keyboardType="number-pad"
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace') {
              handleBackspace('', index);
            }
          }}
          value={code[index]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    width:36,
    height:42,
    borderWidth: 0,
    color: COLORS.primary.text,
    backgroundColor: COLORS.primary.background,
    borderRadius: RADIUS.small,
    textAlign: 'center',
    fontSize: FONT_SIZES.large,
    marginHorizontal: 4,
  },
});

export default FourDigitInput;
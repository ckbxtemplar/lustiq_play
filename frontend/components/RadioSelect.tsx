import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../AuthContext';
import { COLORS, FONT_SIZES } from '../styles/constants';
import LustiqButton from '../components/LustiqButton';

interface Option {
  label: string;
  value: string;
}

interface RadioSelectProps {
  options: Option[];
  onSelect: (value: string) => void;
}

const RadioSelect: React.FC<RadioSelectProps> = ({ options, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState<string>('');
  const [waitingMessage, setWaitingMessage] = useState('Tovább');   
  const { joinedUser } = useAuth();    

  const handleSelect = () => {
    onSelect(selectedValue === 'custom' ? customValue : selectedValue || '');
    const wm = "Várunk "+joinedUser.username+" válaszára...";
    setWaitingMessage(wm);
  };

  const handleCustomChange = (text: string) => {
    setCustomValue(text);
    setSelectedValue('custom'); // Automatikusan kijelöli a custom opciót, ha elkezdenek írni
  };

  return (
    <View style={styles.container}>
        <View style={styles.containerAnswers}>
        {options.map((option) => (
            <View key={option.value} style={styles.optionContainer}>
            <TouchableOpacity
                style={styles.radio}
                onPress={() => setSelectedValue(option.value)}
            >
                <View
                style={[
                    styles.radioOuter,
                    selectedValue === option.value && styles.radioSelected,
                ]}
                >
                {selectedValue === option.value && <View style={styles.radioInner} />}
                </View>
                {option.value === 'custom' ? (
                <TextInput
                    style={styles.customInput}
                    value={customValue}
                    onChangeText={handleCustomChange}
                    placeholder="egyedi"
                    placeholderTextColor="#AAA"
                />
                ) : (
                <Text style={styles.label}>{option.label}</Text>
                )}
            </TouchableOpacity>
            </View>
        ))}
        </View>
      {/* Gomb a kiválasztott érték küldésére */}
     <LustiqButton title={waitingMessage} onPress={handleSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    width:'90%'    
  },
  containerAnswers: {  
    paddingVertical:30,
  },
  optionContainer: {
    marginVertical: 0,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary.text,
  },
  radioSelected: {
    borderColor: COLORS.primary.text,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    color:'white',
    minHeight:30,
    alignContent: 'center',    
  },
  customInput: {
    borderBottomWidth: 1,
    borderColor: COLORS.primary.text,
    paddingVertical: 5,
    fontSize: FONT_SIZES.medium,
    color: 'white',
    flex: 1, // Kitölti a rendelkezésre álló helyet
    minHeight:30
  }
});

export default RadioSelect;

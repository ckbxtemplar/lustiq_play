import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '../styles/constants';
import LustiqButton from '../components/LustiqButton';
import Octicons from '@expo/vector-icons/Octicons';

interface Option {
  id: number;
  title: string;
  description: string;
  score: string;
}

interface RadioSelectProps {
  options: Option[];
  parent: number;
  type: string;
  disabled?: boolean;
  buttonMessage: string;
  onSelect: (value: string, parent: number) => void;
}

const RadioSelect: React.FC<RadioSelectProps> = ({ options, parent, type, disabled, buttonMessage, onSelect }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState<string>('');
  

  const extendedOptions = type === 'optionsAndCustom'
    ? [...options, { id: 0, title: 'Egyedi érték', description: '', score: 'custom' }]
    : options; 

  const handleSelect = () => {
    const selectedOption = extendedOptions.find((option) => option.id === selectedId);
    const value = selectedOption?.score === 'custom' ? customValue : String(selectedOption?.id) || '';
    onSelect(value, parent);
  };

  const handleCustomChange = (text: string) => {
    setCustomValue(text);
    const customOption = extendedOptions.find((option) => option.score === 'custom');
    if (customOption) {
      setSelectedId(customOption.id); // Automatikusan kijelöli a custom opciót, ha elkezdenek írni
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerAnswers}>
        {extendedOptions.map((option) => (
          <View key={option.id} style={styles.optionContainer}>
            <TouchableOpacity
              style={styles.radio}
              onPress={() => setSelectedId(option.id)}
            >
              <View
                style={[
                  styles.radioOuter,
                  selectedId === option.id && styles.radioSelected,
                ]}
              >
                {selectedId === option.id && <View style={styles.radioInner} />}
              </View>
              {option.score === 'custom' ? (
                <TextInput
                  style={styles.customInput}
                  value={customValue}
                  onChangeText={handleCustomChange}
                  placeholder="egyedi"
                  placeholderTextColor="#AAA"
                />
              ) : (
                <>
                  { option.title && <Text style={styles.title}>{option.title}</Text> }
                  { option.description && <Text style={styles.label}>{option.description}</Text> }
                </>
              )}
            </TouchableOpacity>
          </View>
        ))}
        { type === 'talk' && 
        <View style={styles.containerTalk}>
          <Text style={{ alignSelf: 'center', color: COLORS.primary.text, marginRight:8 }}>Beszélgessetek</Text>
          <Octicons name="comment-discussion" size={24} color={COLORS.primary.text} />
        </View>
        }
      </View>
      {/* Gomb a kiválasztott érték küldésére */}
      <LustiqButton title={buttonMessage} disabled={disabled} onPress={handleSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    width: '90%',
  },
  containerAnswers: {
    paddingVertical: 30,
  },
  optionContainer: {
    marginVertical: 5,
    alignSelf: 'flex-start',
    alignContent: 'center'    
  },
  radio: {
    flexDirection: 'row',
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary.text,
    justifyContent: 'center',
    marginRight: 10,
    marginTop:4
  },
  radioInner: {
    height: 10,
    width: 10,
    alignSelf: 'center',
    borderRadius: 5,
    backgroundColor: COLORS.primary.text,
  },
  radioSelected: {
    borderColor: COLORS.primary.text,
  },
  title: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.secondary.text,
    minHeight: 30,
    alignContent: 'center',
  },
  label: {
    fontSize: FONT_SIZES.small,
    color: 'white',
    minHeight: 30,
    alignContent: 'center',
  },
  customInput: {
    borderBottomWidth: 1,
    borderColor: COLORS.primary.text,
    paddingVertical: 5,
    fontSize: FONT_SIZES.medium,
    color: 'white',    
    height:28,
    width:'85%',
    alignContent:'flex-start'
  },
  containerTalk:{
    flexDirection: 'row', // Egy sorban legyenek az elemek
    justifyContent: 'center', // Vízszintesen középre igazítás
    alignItems: 'center', // Függőlegesen középre igazítás
    padding: 10,    
  }
});

export default RadioSelect;

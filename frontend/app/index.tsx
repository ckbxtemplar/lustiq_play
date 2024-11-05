import React from 'react';
import { View, Text} from 'react-native';
import Footer from '../components/Footer';
import globalStyles from '../styles/styles';

const IndexScreen = () => {

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.container}>
        <Text>.</Text>
      </View>
      <Footer />
    </View>
  );
};

export default IndexScreen;

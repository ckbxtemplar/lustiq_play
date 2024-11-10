import React from 'react';
import { View, Text} from 'react-native';
import { Redirect  } from 'expo-router';
import globalStyles from '../styles/styles';
import { useAuth } from '../AuthContext';

const IndexScreen = () => {
  const { loggedIn } = useAuth();

  if (loggedIn) {
    return <Redirect href={'/home'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  } else {
    return <Redirect href={'/login'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat    
  }

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.container}>
        <Text>index</Text>
      </View>
    </View>
  );
};

export default IndexScreen;

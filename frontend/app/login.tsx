import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Alert } from 'react-native';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import Footer from '../components/Footer';
import LustiqButton from '../components/LustiqButton';
import ImageLogo from '../components/ImageLogo';
import globalStyles from '../styles/styles';

const LoginScreen = () => {
  const { platformdata, user, loggedIn, logIn, logOut } = useAuth();    

  const [showRegistration, setShowRegistration] = useState(false);
  const devHost = platformdata.devHost;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');  
  const [username, setUsername] = useState(''); 
  const [message, setMessage] = useState('');  

  // LOGIN
  const login = () => {
    axios.post(devHost+'/login', { email, password })
      .then(response => {
        const { token } = response.data;
        const userData = {name:'Viktor', id:1};
        logIn(userData);
       
        axios.get(devHost+'/hello', {
          headers: { 'Authorization': token }
        })
        .then(res => {
            setMessage(res.data);
        })
        .catch(err => {
          Alert.alert('Error', 'Could not retrieve message');
          console.log('Could not retrieve message');
        });
      })
      .catch(err => {
        Alert.alert('Error', 'Invalid email or password');
        console.log('Invalid email or password');
      });
  };

  // REGISTRATION
  const register = () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      console.log('Passwords do not match');      
      return;
    }

    axios.post(devHost+'/register', {
      email,
      password,
      username      
    })
    .then(response => {
      Alert.alert('Success', 'Registration successful!');
      console.log('Registration successful!');      
      setShowRegistration(false); // Vissza a bejelentkezési felületre
    })
    .catch(err => {
      Alert.alert('Error', 'Registration failed');
      console.log('Registration failed');      
    });
  };

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.container}>
      <ImageLogo/>
      {showRegistration ? (
        // Regisztrációs felület
        <>
          <Text>Username</Text>
          <TextInput
           style={ globalStyles.input }
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#CF3E45"
          />
          <Text>Email</Text>
          <TextInput
            style={ globalStyles.input }
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#CF3E45"
          />
          <Text>Password</Text>
          <TextInput
            style={ globalStyles.input }
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Password"
            placeholderTextColor="#CF3E45"
          />
          <Text>Confirm Password</Text>
          <TextInput
            style={ globalStyles.input }
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            placeholder="Confirm Password"
            placeholderTextColor="#CF3E45"
          />
          <View style={globalStyles.button}><LustiqButton  title="Regist" onPress={register} /></View>
          <View style={{ marginBottom:10 }}><LustiqButton title="Back to Login" onPress={() => setShowRegistration(false)} /></View>
        </>
      ) : (
        // Bejelentkezési felület
        <>        
          <Text>Email</Text>
          <TextInput
            style={ globalStyles.input }
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#CF3E45"
          />
          <Text>Password</Text>
          <TextInput
            style={ globalStyles.input }
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Password"
            placeholderTextColor="#CF3E45"
          />
          <View style={{ marginBottom:10 }}><LustiqButton title="Login" onPress={login} /></View>
          <View style={{ marginBottom:10 }}><LustiqButton title="Regist" onPress={() => setShowRegistration(true)} /></View>
          {message ? <Text style={{ marginTop: 20 }}>{message}</Text> : null}
        </>
      )}
      </View>
      <Footer />  
    </View>
  );
};

console.log('https://lustiq.eu');
export default LoginScreen;

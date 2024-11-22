import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect  } from 'expo-router';
import axios from 'axios';
import FooterLogin from '../components/FooterLogin';
import LustiqButton from '../components/LustiqButton';
import ImageLogo from '../components/ImageLogo';
import globalStyles from '../styles/styles';
import JWT from 'expo-jwt';

const LoginScreen = () => {
  const { loggedIn, platformdata, logIn } = useAuth();    
  const [showRegistration, setShowRegistration] = useState(false);
  const devHost = platformdata.devHost;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');  
  const [username, setUsername] = useState(''); 
  const [message, setMessage] = useState('');  

  // LOGIN
  const login = () => {
    axios.post(`http://${devHost}:8090/login`, { email, password })
      .then(response => {
        const { token } = response.data; 
        // const decodedToken = JWT.decode(token, 'yvhtR5}#O]w7lAs');     
        const decodedToken = token;
        logIn(decodedToken);
       
        axios.get(`http://${devHost}:8090/hello`, {
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
        console.log(err.response || err);        
        Alert.alert('Error', 'Invalid email or password');
      });
  };

  // REGISTRATION
  const register = () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      console.log('Passwords do not match');      
      return;
    }

    axios.post(`http://${devHost}:8090/register`, {
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

  if (loggedIn) {
    return <Redirect href={'/home'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  }    

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.loginContainer}>
        <Text style={{fontSize:20}}>HAMAROSAN INDULUNK</Text>
      <ImageLogo /> 
      {showRegistration ? (
        // Regisztrációs felület
        <>
          <Text>Felhasználónév</Text>
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
          <Text>Jelszó</Text>
          <TextInput
            style={ globalStyles.input }
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Jelszó"
            placeholderTextColor="#CF3E45"
          />
          <Text>Jelszó újra</Text>
          <TextInput
            style={ globalStyles.input }
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            placeholder="Jelszó újra"
            placeholderTextColor="#CF3E45"
          />
          <View style={{ marginBottom:10 }}><LustiqButton  title="Regisztráció" onPress={register} /></View>
          <View style={{ marginBottom:10 }}><LustiqButton title="Vissza" onPress={() => setShowRegistration(false)} /></View>
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
          <Text>Jelszó</Text>
          <TextInput
            style={ globalStyles.input }
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Jelszó"
            placeholderTextColor="#CF3E45"
          />
          <View style={{ marginBottom:10 }}><LustiqButton title="Login" onPress={login} /></View>
          <View style={{ marginBottom:10 }}><LustiqButton title="Regist" onPress={() => setShowRegistration(true)} /></View>
          {message ? <Text style={{ marginTop: 20 }}>{message}</Text> : null}
        </>
      )}
      </View>
      <FooterLogin />  
    </View>
  );
};

export default LoginScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useAuth } from '../AuthContext';
import { Redirect  } from 'expo-router';
import axios from 'axios';
import FooterLogin from '../components/FooterLogin';
import LustiqButton from '../components/LustiqButton';
import ImageLogo from '../components/ImageLogo';
import globalStyles from '../styles/styles';

const LoginScreen = () => {
  const { loggedIn, user, platformdata, logIn } = useAuth();    
  const [showRegistration, setShowRegistration] = useState(false);
  const devHost = platformdata.devHost;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');  
  const [username, setUsername] = useState(''); 
  const [message, setMessage] = useState('');  

  // LOGIN
  const login = () => {
    axios.post(`https://${devHost}/login`, { email, password })
      .then(response => {
        const { token } = response.data; 
  
        const decodedToken = token;
        logIn(decodedToken);
       
        axios.get(`https://${devHost}/hello`, {
          headers: { 'Authorization': token }
        })
        .then(res => {
            setMessage(res.data);
        })
        .catch(err => {
          if (platformdata.platform === 'web') {
            window.alert('Could not retrieve message');
          } else {
            Alert.alert('Error', 'Could not retrieve message');
          }           
          console.log('Could not retrieve message');
        });
      })
      .catch(err => {
        console.log(err.response || err);        
        if (platformdata.platform === 'web') {
          window.alert('Invalid email or password');
        } else {
          Alert.alert('Error', 'Invalid email or password');
        }         
      });
  };

  // REGISTRATION
  const register = () => {
    if (password !== confirmPassword) {
      if (platformdata.platform === 'web') {
        window.alert('Passwords do not match');
      } else {
        Alert.alert('Error', 'Passwords do not match');
      }       
      console.log('Passwords do not match');      
      return;
    }

    axios.post(`https://${devHost}/register`, {
      email,
      password,
      username      
    })
    .then(response => {
      if (platformdata.platform === 'web') {
        window.alert('Registration successful!');
      } else {
        Alert.alert('Success', 'Registration successful!');
      }       
      console.log('Registration successful!');      
      setShowRegistration(false); // Vissza a bejelentkezési felületre
    })
    .catch(err => {
      if (platformdata.platform === 'web') {
        window.alert('Registration failed');
      } else {
        Alert.alert('Error', 'Registration failed');
      }       
      console.log('Registration failed');      
    });
  };

  useEffect(() => {
    if (platformdata.platform === 'web') document.title = showRegistration ? 'Lustiq Play - Registration' : 'Lustiq Play - Login';
  }, [showRegistration]);

  if (loggedIn && user?.sessionToken ) {
    return <Redirect href={'/home'} />; // Ha nem vagy bejelentkezve, nem jelenítjük meg a tartalmat
  }    

  return (
    <View style={globalStyles.body}>
      <View style={globalStyles.loginContainer}>        
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

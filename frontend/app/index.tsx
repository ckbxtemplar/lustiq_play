import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
// import { Alert } from 'react-native';
import axios from 'axios';

const App = () => {
  const [showRegistration, setShowRegistration] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');  
  const [username, setUsername] = useState(''); 
  const [message, setMessage] = useState('');  

  // LOGIN
  const login = () => {
    axios.post('http://localhost:3000/login', { email, password })
      .then(response => {
        const { token } = response.data;
        axios.get('http://localhost:3000/hello', {
          headers: { 'Authorization': token }
        })
        .then(res => {
          setMessage(res.data);
        })
        .catch(err => {
          // Alert.alert('Error', 'Could not retrieve message');
          console.log('Could not retrieve message');
        });
      })
      .catch(err => {
        // Alert.alert('Error', 'Invalid email or password');
        console.log('Invalid email or password');
      });
  };

  // REGISTRATION
  const register = () => {
    if (password !== confirmPassword) {
      // Alert.alert('Error', 'Passwords do not match');
      console.log('Passwords do not match');      
      return;
    }

    axios.post('http://localhost:3000/register', {
      email,
      password,
      username      
    })
    .then(response => {
      // Alert.alert('Success', 'Registration successful!');
      console.log('Registration successful!');      
      setShowRegistration(false); // Vissza a bejelentkezési felületre
    })
    .catch(err => {
      // Alert.alert('Error', 'Registration failed');
      console.log('Registration failed');      
    });
  };

  return (
    <View style={{ padding: 20 }}>
      {showRegistration ? (
        // Regisztrációs felület
        <>
          <Text>Username</Text>
          <TextInput
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
          />
          <Text>Email</Text>
          <TextInput
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
          />
          <Text>Password</Text>
          <TextInput
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Password"
          />
          <Text>Confirm Password</Text>
          <TextInput
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            placeholder="Confirm Password"
          />
          <View style={{ marginBottom:10 }}><Button title="Register" onPress={register} /></View>
          <View style={{ marginBottom:10 }}><Button title="Back to Login" onPress={() => setShowRegistration(false)} /></View>
        </>
      ) : (
        // Bejelentkezési felület
        <>
          <Text>Email</Text>
          <TextInput
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
          />
          <Text>Password</Text>
          <TextInput
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Password"
          />
          <View style={{ marginBottom:10 }}><Button title="Login" onPress={login} /></View>
          <View style={{ marginBottom:10 }}><Button title="Register" onPress={() => setShowRegistration(true)} /></View>
          {message ? <Text style={{ marginTop: 20 }}>{message}</Text> : null}
        </>
      )}
    </View>
  );
};

console.log('https://lustiq.eu');
export default App;

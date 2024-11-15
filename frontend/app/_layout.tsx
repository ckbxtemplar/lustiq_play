import { Stack, useRouter } from 'expo-router';
import { View, Button } from 'react-native';
import { AuthProvider } from '../AuthContext';

function RootLayoutContent() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <View style={{ flexDirection: 'row' }}>
            <Button onPress={() => router.push('/login')} title="Login" />
            <Button onPress={() => router.push('/')} title="Index" />
            <Button onPress={() => router.push('/home')} title="Home" />
            <Button onPress={() => router.push('/lobby')} title="Lobby" />              
            <Button onPress={() => router.push('/survey')} title="Survey" />
            <Button onPress={() => router.push('/game')} title="Game" />              
          </View>
        ),
      }}
    >
      <Stack.Screen name="index" />      
      <Stack.Screen name="login" />     
      <Stack.Screen name="home" />
      <Stack.Screen name="lobby" />
      <Stack.Screen name="survey" />            
      <Stack.Screen name="game" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
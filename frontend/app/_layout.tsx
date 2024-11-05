import { Stack, useRouter } from 'expo-router';
import { View , Button } from 'react-native';
import { AuthProvider } from '../AuthContext';

export default function RootLayout() {
  const router = useRouter();

  return (
    <AuthProvider>
      <Stack 
        screenOptions={{ headerShown: true,
        headerLeft: () => (
          <View style={{ flexDirection: 'row' }}>
            <Button
              onPress={() => router.push('/')}
              title="Index"
            />            
            <Button
              onPress={() => router.push('/login')}
              title="Login"
            /> 
            <Button
              onPress={() => router.push('/home')}
              title="Home"
            />            
          </View>         
        ),
       }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
      </Stack>
    </AuthProvider>
  );
}
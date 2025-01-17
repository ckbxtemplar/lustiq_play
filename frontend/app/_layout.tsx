import { Stack } from "expo-router";
import { AuthProvider } from "../AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Lustiq Play",
            headerTitle: 'In Progress', 
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: "Lustiq Play - Login",
            headerTitle: 'In Progress',          
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            title: "Lustiq Play - Home",
            headerTitle: 'In Progress',            
          }}
        />
        <Stack.Screen
          name="lobby"
          options={{
            title: "Lustiq Play - Lobby",
            headerTitle: 'In Progress',            
          }}
        />
        <Stack.Screen
          name="survey"
          options={{
            title: "Lustiq Play - Survey",
            headerTitle: 'In Progress',            
          }}
        />
        <Stack.Screen
          name="game"
          options={{
            title: "Lustiq Play - Game",
            headerTitle: 'In Progress',            
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
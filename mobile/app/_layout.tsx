import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// 🔒 This component handles navigation logic based on user auth state
function RootNavigation() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // if not signed in, go to /LoginScreen
        router.replace('/LoginScreen');
      } else {
        // if signed in, go to tabs
        router.replace('/(tabs)');
      }
    }
  }, [user, loading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}

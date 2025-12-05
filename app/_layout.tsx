import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { storageService } from '@/utils/storage';
import { Sidebar } from '../components/sidebar';

SplashScreen.preventAutoHideAsync();

function useAuthStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set true untuk bypass login

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Bypass check - langsung set true
      setIsLoggedIn(true);
      // Set dummy user untuk testing
      await storageService.saveUser({
        user_id: '1',
        user_name: 'Test User',
        user_saldo: 500000,
      });
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, isLoggedIn };
}

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, isLoggedIn } = useAuthStatus();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 18 : 44 }}>
        <Sidebar />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ title: 'Daftar Akun' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="booking-form" options={{ title: 'Form Pemesanan' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          {isLoggedIn ? null : <Redirect href="/login" />}
        </Stack>
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

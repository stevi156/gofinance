import 'intl';
import 'intl/locale-data/jsonp/pt-BR';

import React from 'react';
import { ThemeProvider } from 'styled-components';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import AppLoading from 'expo-app-loading';
import theme from './src/global/styles/theme';
import { Routes } from './src/routes';
import { AuthProvider, useAuth } from './src/hooks/auth';
import { StatusBar } from 'react-native';
export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  const { userStorageLoading } = useAuth();

  if (!fontsLoaded || userStorageLoading) {
    return <AppLoading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <StatusBar backgroundColor='#5636D3' barStyle='light-content' />
        <Routes />
      </AuthProvider>
    </ThemeProvider>
  );
}

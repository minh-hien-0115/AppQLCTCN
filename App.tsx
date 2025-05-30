import React, { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { LoginNavigators, MainNavigators } from './src/navigations';
import { ThemeProvider, useTheme } from './src/constants/ThemeContext';

const AppWrapper = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const { navigationTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(userAuth => {
      setUser(userAuth);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <MainNavigators /> : <LoginNavigators />}
    </NavigationContainer>
  );
}

export default AppWrapper;
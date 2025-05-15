import React, { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { LoginNavigators, MainNavigators } from './src/navigations';

export default function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(userAuth => {
      setUser(userAuth);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      {user ? <MainNavigators /> : <LoginNavigators />}
    </NavigationContainer>
  );
}
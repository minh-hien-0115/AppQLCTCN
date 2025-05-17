import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChangePasswordScreen, ForgotPasswordScreen, LoginScreen, SignUpScreen } from '../screens/auth';

const Stack = createNativeStackNavigator();

const LoginNavigators = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      {/* <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} options={{headerShown: true}} /> */}
    </Stack.Navigator>
  );
};

export default LoginNavigators;
import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigators from './TabNavigators';
import ChatBotScreen from '../screens/ChatBotScreen';

const MainNavigators = () => {
    const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Main" component={TabNavigators} />
      <Stack.Screen name="ChatBotScreen" component={ChatBotScreen} />
    </Stack.Navigator>
  )
}

export default MainNavigators
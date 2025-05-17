import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HelpAndFeedback from '../screens/setting/HelpAndFeedback';
import FAQScreen from '../screens/setting/FAQScreen';
import InstructionsForUseScreen from '../screens/setting/InstructionsForUseScreen';
import SendFeedbackEmail from '../screens/setting/SendFeedbackEmail';

const Stack = createNativeStackNavigator();

const BackButton = ({navigation}: {navigation: any}) => (
  <TouchableOpacity
    style={{marginLeft: 15}}
    onPress={() => navigation.goBack()}>
    <Feather name="arrow-left" size={24} color="#333" />
  </TouchableOpacity>
);

const HelpAndFbackNavigators = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#333',
      }}>
      <Stack.Screen
        name="HelpAndFeedback"
        component={HelpAndFeedback}
        options={{headerShown: true, title: 'Trợ giúp & Phản hồi'}}
      />
      <Stack.Screen
        name="FAQScreen"
        component={FAQScreen}
        options={({navigation}) => ({
          title: 'Câu hỏi thường gặp',
          headerLeft: () => (
            <TouchableOpacity
              style={{marginLeft: 15}}
              onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="InstructionsForUseScreen"
        component={InstructionsForUseScreen}
        options={({navigation}) => ({
          title: 'Hướng dẫn sử dụng',
          headerLeft: () => (
            <TouchableOpacity
              style={{marginLeft: 15}}
              onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="SendFeedbackEmail"
        component={SendFeedbackEmail}
        options={({navigation}) => ({
          title: 'Gửi phản hồi qua Email',
          headerLeft: () => (
            <TouchableOpacity
              style={{marginLeft: 15}}
              onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default HelpAndFbackNavigators;

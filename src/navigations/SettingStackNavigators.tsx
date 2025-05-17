import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {LanguageScreen, ProfileScreen, SettingScreen} from '../screens/home';
import {TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {ChangePasswordScreen} from '../screens/auth';
import { ExpenseSavingScreen } from '../screens/spending';

const Stack = createNativeStackNavigator();

const SettingStackNavigators = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#333',
      }}>
      <Stack.Screen
        name="SettingMain"
        component={SettingScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({navigation}) => ({
          title: 'Thông tin cá nhân',
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
        name="Language"
        component={LanguageScreen}
        options={({navigation}) => ({
          title: 'Ngôn ngữ',
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
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={({navigation}) => ({
          title: 'Đổi mật khẩu',
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
        name="ExpenseSaving"
        component={ExpenseSavingScreen}
        options={({navigation}) => ({
          title: 'Thói quen chi tiêu và tiết kiệm',
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

export default SettingStackNavigators;
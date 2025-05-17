import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {LanguageScreen, ProfileScreen, SettingScreen} from '../screens/home';
import {TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {ChangePasswordScreen} from '../screens/auth';
import {ExpenseSavingScreen, TrashScreen} from '../screens/spending';
import BanksAndEwallets from '../screens/setting/BanksAndEwallets';
import HelpAndFeedback from '../screens/setting/HelpAndFeedback';
import TOSAndPrivacy from '../screens/setting/TOSAndPrivacy';
import HelpAndFbackNavigators from './HelpAndFbackNavigators';

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
        name="TrashScreen"
        component={TrashScreen}
        options={({navigation}) => ({
          title: 'Thùng rác',
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
      <Stack.Screen
        name="BanksAndEwallets"
        component={BanksAndEwallets}
        options={({navigation}) => ({
          title: 'Ngân hàng & Ví điện tử',
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
        name="HelpAndFeedback"
        component={HelpAndFbackNavigators}
        options={{headerShown: false}}
        // options={({navigation}) => ({
        //   title: 'Trợ giúp & Phản hồi',
        //   headerLeft: () => (
        //     <TouchableOpacity
        //       style={{marginLeft: 15}}
        //       onPress={() => navigation.goBack()}>
        //       <Feather name="arrow-left" size={24} color="#333" />
        //     </TouchableOpacity>
        //   ),
        // })}
      />
      <Stack.Screen
        name="TOSAndPrivacy"
        component={TOSAndPrivacy}
        options={({navigation}) => ({
          title: 'Điều khoản & Chính sách',
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
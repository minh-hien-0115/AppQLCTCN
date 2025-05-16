import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Add, Chart, Home, User, Wallet } from 'iconsax-react-nativejs';
import React from 'react';
import { AddScreen, HomeScreen, SettingScreen, StatisticalScreen, WalletScreen } from '../screens/home';


const Tab = createBottomTabNavigator();

const TabNavigators = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Trang Chủ"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color}) => <Home color={color} size={23} variant="Bold" />,
        }}
      />
      <Tab.Screen
        name="Thêm"
        component={AddScreen}
        options={{
          tabBarIcon: ({color}) => <Add color={color} size={23} variant="Bold" />,
        }}
      />
      <Tab.Screen
        name="Ví"
        component={WalletScreen}
        options={{
          tabBarIcon: ({color}) => <Wallet color={color} size={23} variant="Bold" />,
        }}
      />
      <Tab.Screen
        name="Biểu đồ"
        component={StatisticalScreen}
        options={{
          tabBarIcon: ({color}) => <Chart color={color} size={23} variant="Bold" />,
        }}
      />
      <Tab.Screen
        name="Cài đặt"
        component={SettingScreen}
        options={{
          tabBarIcon: ({color}) => <User color={color} size={23} variant="Bold" />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigators;
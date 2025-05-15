import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { AddScreen, HomeScreen, ProfileScreen, StatisticalScreen, WalletScreen } from '../screens/home';
import { Add, AddSquare, ArchiveSlash, ArchiveTick, Chart, Home, Setting2, StatusUp, User, Wallet } from 'iconsax-react-nativejs';


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
        name="Thông tin"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color}) => <User color={color} size={23} variant="Bold" />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigators;
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import Feather from 'react-native-vector-icons/Feather';

const SettingScreen = ({ navigation }: any) => {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleNotification = () =>
    setIsNotificationEnabled(previous => !previous);
  const toggleTheme = () => setIsDarkTheme(previous => !previous);

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', onPress: () => console.log('Đã đăng xuất') },
      ],
    );
  };

  // Điều hướng sang màn hình Profile
  const handleNavigateProfile = () => {
    navigation.navigate('Profile');
  };

  // Điều hướng sang màn hình Language
  const handleNavigateLanguage = () => {
    navigation.navigate('Language');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cài đặt</Text>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={handleNavigateProfile}
      >
        <Text style={styles.settingText}>Thông tin cá nhân</Text>
        <Feather name="chevron-right" size={24} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={handleNavigateLanguage}
      >
        <Text style={styles.settingText}>Ngôn ngữ</Text>
        <Feather name="chevron-right" size={24} color="#999" />
      </TouchableOpacity>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Thông báo</Text>
        <Switch
          value={isNotificationEnabled}
          onValueChange={toggleNotification}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Chế độ tối</Text>
        <Switch
          value={isDarkTheme}
          onValueChange={toggleTheme}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingText: {
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#e53935',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
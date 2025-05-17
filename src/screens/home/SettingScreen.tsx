import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../../constants/ThemeContext';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

const SettingScreen = ({navigation}: any) => {
  const [isNotificationEnabled, setIsNotificationEnabled] = React.useState(false);
  const {theme, toggleTheme, colors} = useTheme();

  const toggleNotification = async () => {
    if (!isNotificationEnabled) {
      const authStatus = await messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        setIsNotificationEnabled(true);
        const fcmToken = await messaging().getToken();
        console.log('FCM Token:', fcmToken);
        Alert.alert('Thông báo', 'Bạn đã bật thông báo đẩy');
      } else {
        Alert.alert(
          'Quyền bị từ chối',
          'Bạn cần cho phép quyền thông báo để bật tính năng này',
        );
      }
    } else {
      try {
        await messaging().deleteToken();
        setIsNotificationEnabled(false);
        Alert.alert('Thông báo', 'Bạn đã tắt thông báo đẩy');
      } catch (error) {
        console.log('Lỗi khi tắt thông báo:', error);
        Alert.alert('Lỗi', 'Không thể tắt thông báo');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Đăng xuất',
          onPress: async () => {
            try {
              await auth().signOut();
              console.log('Đã đăng xuất');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handleNotImplemented = () =>
    Alert.alert('Chức năng chưa được phát triển');

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={{paddingBottom: 30}}>
      <Text style={[styles.title, {color: colors.text}]}>Cài đặt</Text>

      {/* Thông tin cá nhân */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('Profile')}>
        <Text style={[styles.settingText, {color: colors.text}]}>
          Thông tin cá nhân
        </Text>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Ngôn ngữ */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('Language')}>
        <Text style={[styles.settingText, {color: colors.text}]}>Ngôn ngữ</Text>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Đổi mật khẩu */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('ChangePassword')}>
        <Text style={[styles.settingText, {color: colors.text}]}>
          Đổi mật khẩu
        </Text>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Thói quen chi tiêu */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('ExpenseSaving')}>
        <Text style={[styles.settingText, {color: colors.text}]}>
          Tùy chỉnh thói quen chi tiêu / tiết kiệm
        </Text>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Thông báo */}
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, {color: colors.text}]}>Thông báo</Text>
        <Switch value={isNotificationEnabled} onValueChange={toggleNotification} />
      </View>

      {/* Chế độ tối */}
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, {color: colors.text}]}>Chế độ tối</Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
      </View>

      {/* Định dạng ngày tháng */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={handleNotImplemented}>
        <Text style={[styles.settingText, {color: colors.text}]}>
          Định dạng ngày tháng
        </Text>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Quản lý tài khoản ngân hàng */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={handleNotImplemented}>
        <Text style={[styles.settingText, {color: colors.text}]}>
          Quản lý tài khoản ngân hàng / ví điện tử
        </Text>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Trợ giúp & Phản hồi */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('Help')}>
        <Text style={[styles.settingText, {color: colors.text}]}>
          Trợ giúp & Phản hồi
        </Text>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Điều khoản & Chính sách */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={handleNotImplemented}>
        <Text style={[styles.settingText, {color: colors.text}]}>
          Điều khoản dịch vụ & Chính sách bảo mật
        </Text>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Đăng xuất */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
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
    marginHorizontal: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
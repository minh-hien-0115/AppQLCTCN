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
import {appColors} from '../../constants/appColors';

const SettingScreen = ({navigation}: any) => {
  const [isNotificationEnabled, setIsNotificationEnabled] =
    React.useState(false);
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
        <View style={styles.settingLeft}>
          <Feather name="user" size={22} color={colors.tabBarIcon} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Thông tin cá nhân
          </Text>
        </View>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Ngôn ngữ */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('Language')}>
        <View style={styles.settingLeft}>
          <Feather name="globe" size={22} color={colors.tabBarIcon} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Ngôn ngữ
          </Text>
        </View>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Đổi mật khẩu */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('ChangePassword')}>
        <View style={styles.settingLeft}>
          <Feather name="lock" size={22} color={colors.tabBarIcon} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Đổi mật khẩu
          </Text>
        </View>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('TrashScreen')}>
        <View style={styles.settingLeft}>
          <Feather name="trash-2" size={22} color={colors.tabBarIcon} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Thùng rác
          </Text>
        </View>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Thói quen chi tiêu */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('ExpenseSaving')}>
        <View style={styles.settingLeft}>
          <Feather name="activity" size={22} color={colors.tabBarIcon} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Tùy chỉnh thói quen chi tiêu / tiết kiệm
          </Text>
        </View>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Thông báo */}
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Feather name="bell" size={22} color={colors.tabBarIcon} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Thông báo
          </Text>
        </View>
        <Switch
          value={isNotificationEnabled}
          onValueChange={toggleNotification}
          trackColor={{true: appColors.primary}}
          thumbColor={appColors.white}
        />
      </View>

      {/* Chế độ tối */}
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Feather name="moon" size={22} color={colors.tabBarIcon} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Chế độ tối
          </Text>
        </View>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{true: appColors.primary}}
          thumbColor={appColors.white}
        />
      </View>

      {/* Quản lý tài khoản ngân hàng / ví điện tử */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('BanksAndEwallets')}>
        <View style={styles.settingLeft}>
          <Feather name="credit-card" size={22} color={colors.tabBarIcon} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Quản lý tài khoản ngân hàng / ví điện tử
          </Text>
        </View>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Điều khoản dịch vụ & Chính sách bảo mật */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('TOSAndPrivacy')}>
        <View style={styles.settingLeft}>
          <Feather name="file-text" size={22} color={colors.tabBarIcon} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Điều khoản dịch vụ & Chính sách bảo mật
          </Text>
        </View>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Trợ giúp & Phản hồi */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('HelpAndFeedback')}>
        <View style={styles.settingLeft}>
          <Feather name="help-circle" size={22} color={colors.tabBarIcon} />
          <Text style={[styles.settingText, {color: colors.text}]}>
            Trợ giúp & Phản hồi
          </Text>
        </View>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
      </TouchableOpacity>

      {/* Đăng xuất */}
      <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
        <View style={styles.settingLeft}>
          <Feather name="log-out" size={22} color="red" />
          <Text style={[styles.settingText, { color: 'red' }]}>Đăng xuất</Text>
        </View>
        <Feather name="chevron-right" size={24} color={colors.tabBarIcon} />
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

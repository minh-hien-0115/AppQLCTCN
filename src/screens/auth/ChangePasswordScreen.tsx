import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import Feather from 'react-native-vector-icons/Feather';

const ChangePasswordScreen = ({ navigation }: any) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isCurrentPasswordHidden, setIsCurrentPasswordHidden] = useState(true);
  const [isNewPasswordHidden, setIsNewPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true);

  const reauthenticate = async (currentPassword: string) => {
    const user = auth().currentUser;
    if (!user || !user.email) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
      return false;
    }
    const credential = auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    try {
      await user.reauthenticateWithCredential(credential);
      return true;
    } catch (error) {
      console.error('Reauthentication failed:', error);
      Alert.alert('Lỗi', 'Mật khẩu hiện tại không đúng');
      return false;
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không trùng khớp');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
      return;
    }

    // Kiểm tra lại mk cũ
    const isReauthenticated = await reauthenticate(currentPassword);
    if (!isReauthenticated) {
      return; // Nếu mk cũ sai thì dừng
    }

    try {
      await user.updatePassword(newPassword);
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi');

      // Đăng xuất ng dùng sau khi đổi mk thành công
      await auth().signOut();

      // Chuyển về screen đăng nhập
      navigation.navigate('LoginScreen');
    } catch (error: any) {
      console.error('Change password error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể thay đổi mật khẩu');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đổi Mật Khẩu</Text>

      {/* MK hiện tại */}
      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color="#999" style={styles.leftIcon} />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu hiện tại"
          secureTextEntry={isCurrentPasswordHidden}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setIsCurrentPasswordHidden(prev => !prev)}
          activeOpacity={0.7}
        >
          <Feather
            name={isCurrentPasswordHidden ? 'eye-off' : 'eye'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      {/* MK mới */}
      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color="#999" style={styles.leftIcon} />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu mới"
          secureTextEntry={isNewPasswordHidden}
          value={newPassword}
          onChangeText={setNewPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setIsNewPasswordHidden(prev => !prev)}
          activeOpacity={0.7}
        >
          <Feather
            name={isNewPasswordHidden ? 'eye-off' : 'eye'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      {/* Nhập lại mk mới */}
      <View style={styles.inputContainer}>
        <Feather name="repeat" size={20} color="#999" style={styles.leftIcon} />
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          secureTextEntry={isConfirmPasswordHidden}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setIsConfirmPasswordHidden(prev => !prev)}
          activeOpacity={0.7}
        >
          <Feather
            name={isConfirmPasswordHidden ? 'eye-off' : 'eye'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Cập Nhật Mật Khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
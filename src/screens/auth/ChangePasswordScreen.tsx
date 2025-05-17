import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Feather from 'react-native-vector-icons/Feather';

const ChangePasswordScreen = ({ navigation }: any) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordHidden, setIsNewPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true);

  // Modal hiện khi cần người dùng đăng nhập lại (reauthenticate)
  const [modalVisible, setModalVisible] = useState(false);
  const [reauthEmail, setReauthEmail] = useState('');
  const [reauthPassword, setReauthPassword] = useState('');
  const [isReauthPasswordHidden, setIsReauthPasswordHidden] = useState(true);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
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

    try {
      // Nếu bạn muốn kiểm tra user document Firestore:
      // const userDoc = await firestore().collection('users').doc(user.uid).get();
      // if (!userDoc.exists) {
      //   Alert.alert('Lỗi', 'Tài khoản không tồn tại trong hệ thống');
      //   return;
      // }

      await user.updatePassword(newPassword);
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi');
      navigation.goBack();

    } catch (error: any) {
      console.error('Change password error:', error);

      if (error.code === 'auth/requires-recent-login') {
        // Hiện modal yêu cầu nhập lại email và password
        setModalVisible(true);
      } else {
        Alert.alert('Lỗi', error.message || 'Không thể thay đổi mật khẩu');
      }
    }
  };

  // Hàm đăng nhập lại (reauthenticate)
  const handleReauthenticate = async () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
      setModalVisible(false);
      return;
    }

    const credential = auth.EmailAuthProvider.credential(reauthEmail, reauthPassword);

    try {
      await user.reauthenticateWithCredential(credential);
      setModalVisible(false);
      Alert.alert('Đăng nhập lại thành công', 'Bạn có thể đổi mật khẩu ngay bây giờ');
      // Sau khi reauthenticate thành công, gọi lại đổi mật khẩu
      handleChangePassword();
    } catch (error: any) {
      console.error('Reauthenticate error:', error);
      Alert.alert('Lỗi', 'Thông tin đăng nhập không đúng');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đổi Mật Khẩu</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu mới"
          secureTextEntry={isNewPasswordHidden}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          style={styles.icon}
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

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          secureTextEntry={isConfirmPasswordHidden}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.icon}
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

      {/* Modal đăng nhập lại */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đăng nhập lại để đổi mật khẩu</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={reauthEmail}
              onChangeText={setReauthEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                secureTextEntry={isReauthPasswordHidden}
                value={reauthPassword}
                onChangeText={setReauthPassword}
              />
              <TouchableOpacity
                style={styles.icon}
                onPress={() => setIsReauthPasswordHidden(prev => !prev)}
                activeOpacity={0.7}
              >
                <Feather
                  name={isReauthPasswordHidden ? 'eye-off' : 'eye'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleReauthenticate}>
              <Text style={styles.buttonText}>Đăng Nhập Lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#dc3545', marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    paddingRight: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
  },
  icon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
});
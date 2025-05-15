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

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        'Thành công',
        'Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.'
      );
      navigation.goBack();
    } catch (error: any) {
      // Kiểm tra mã lỗi
      if (error.code === 'auth/user-not-found') {
        Alert.alert(
          'Tài khoản không tồn tại',
          'Email bạn nhập chưa được đăng ký trên hệ thống.'
        );
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Email không hợp lệ', 'Vui lòng nhập đúng định dạng email.');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert(
          'Thao tác bị chặn',
          'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.'
        );
      } else {
        console.error('Reset error:', error);
        Alert.alert('Lỗi', error.message || 'Không thể gửi email khôi phục');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên Mật Khẩu</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập email đã đăng ký"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Gửi Email Khôi Phục</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

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
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
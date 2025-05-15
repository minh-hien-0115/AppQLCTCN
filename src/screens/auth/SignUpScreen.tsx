import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SignUpScreen = ({ navigation }: any) => {
  const [fullname, setFullname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const validateEmailAndPassword = () => {
    const emailRegex = /^([a-zA-Z0-9._%+-]+@(gmail\.com|student\.[a-zA-Z0-9-]+\.edu\.vn))$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;

    if (!emailRegex.test(email)) {
      Alert.alert(
        'Email không hợp lệ',
        'Email phải là @gmail.com hoặc student.<tên_trường>.edu.vn'
      );
      return false;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert(
        'Mật khẩu không hợp lệ',
        'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và ký tự đặc biệt.'
      );
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!fullname || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }

    if (!validateEmailAndPassword()) {
      return;
    }

    try {
      await auth().createUserWithEmailAndPassword(email, password);
      Alert.alert('Thành công', 'Đăng ký thành công');
    } catch (error: any) {
      console.log('Signup error:', error);
      Alert.alert('Lỗi đăng ký', error.message || 'Đã xảy ra lỗi');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Đăng Ký</Text>

      {/* Fullname */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          placeholderTextColor="#888"
          value={fullname}
          onChangeText={setFullname}
        />
        {fullname.length > 0 && (
          <TouchableOpacity style={styles.iconRight} onPress={() => setFullname('')}>
            <Feather name="x-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {email.length > 0 && (
          <TouchableOpacity style={styles.iconRight} onPress={() => setEmail('')}>
            <Feather name="x-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.iconRight}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#888"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.iconRight}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Đăng ký */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Đăng Ký</Text>
      </TouchableOpacity>

      {/* Link đến màn hình đăng nhập */}
      <TouchableOpacity style={styles.loginLink}>
        <Text style={styles.loginText}>
          Đã có tài khoản?{' '}
          <Text style={styles.loginTextBold} onPress={() => navigation.navigate('Login')}>
            Đăng nhập
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Social Login Icons */}
      <View style={styles.socialIconsContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="logo-facebook" size={30} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="logo-google" size={30} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="logo-apple" size={30} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#051d5f',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingRight: 40,
  },
  iconRight: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 15,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
  },
  loginText: {
    color: '#333',
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: '#1e90ff',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  iconButton: {
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
});
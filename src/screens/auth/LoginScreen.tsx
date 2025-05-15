import auth from '@react-native-firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { appColors } from '../../constants/appColors';

const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isremember, setIsRemember] = useState<boolean>(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    if (!validateEmailAndPassword()) {
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      console.log('Login error:', error);
      Alert.alert('Lỗi đăng nhập', error.message || 'Đã xảy ra lỗi');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>

      {/* Email input + x icon */}
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
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setEmail('')}>
            <Feather name="x-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Password input + eye icon */}
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
          onPress={() => setShowPassword(!showPassword)}>
          <Feather
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Remember me and forgot password */}
      <View style={styles.optionsContainer}>
        <View style={styles.rememberContainer}>
          <Switch
            value={isremember}
            onValueChange={setIsRemember}
            trackColor={{true: appColors.primary}}
            thumbColor={appColors.white}
          />
          <Text style={styles.optionText}>Ghi nhớ mật khẩu</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
          <Text style={styles.optionText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupLink}
        onPress={() => navigation.navigate('SignUpScreen')}>
        <Text style={styles.signupText}>
          Chưa có tài khoản? <Text style={styles.signupTextBold}>Đăng ký</Text>
        </Text>
      </TouchableOpacity>

      {/* Social Media Icons */}
      <View style={styles.socialIconsContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="call-outline" size={30} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="logo-facebook" size={30} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="logo-apple" size={30} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="logo-google" size={30} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
  signupLink: {
    marginTop: 20,
  },
  signupText: {
    color: '#333',
  },
  signupTextBold: {
    fontWeight: 'bold',
    color: '#1e90ff',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  optionText: {
    fontSize: 14,
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
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  CloseCircle,
  Eye,
  EyeSlash,
  Lock,
  Profile2User,
  Sms,
  User,
} from 'iconsax-react-nativejs';
import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SignUpScreen = ({navigation}: any) => {
  const [fullname, setFullname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const validateEmailAndPassword = () => {
    const emailRegex =
      /^([a-zA-Z0-9._%+-]+@(gmail\.com|student\.[a-zA-Z0-9-]+\.edu\.vn))$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;

    if (!emailRegex.test(email)) {
      Alert.alert(
        'Email không hợp lệ',
        'Email phải là @gmail.com hoặc student.<tên_trường>.edu.vn',
      );
      return false;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert(
        'Mật khẩu không hợp lệ',
        'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và ký tự đặc biệt.',
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
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;

      // Lưu thông tin người dùng
      await firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        fullname: fullname,
        email: user.email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Thành công', 'Đăng ký thành công');
      navigation.navigate('Login');
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
        <User size={20} color="#888" style={styles.iconLeft} />
        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          placeholderTextColor="#888"
          value={fullname}
          onChangeText={setFullname}
        />
        {fullname.length > 0 && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setFullname('')}>
            <CloseCircle size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Sms size={20} color="#888" style={styles.iconLeft} />
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
            <CloseCircle size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <Lock size={20} color="#888" style={styles.iconLeft} />
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
          {showPassword ? (
            <Eye size={20} color="#888" />
          ) : (
            <EyeSlash size={20} color="#888" />
          )}
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputContainer}>
        <Feather name="repeat" size={20} color="#999" style={styles.iconLeft} />
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
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          {showConfirmPassword ? (
            <Eye size={20} color="#888" />
          ) : (
            <EyeSlash size={20} color="#888" />
          )}
        </TouchableOpacity>
      </View>

      {/* Đăng ký */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Đăng Ký</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink}>
        <Text style={styles.loginText}>
          Đã có tài khoản?{' '}
          <Text
            style={styles.loginTextBold}
            onPress={() => navigation.navigate('LoginScreen')}>
            Đăng nhập
          </Text>
        </Text>
      </TouchableOpacity>

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
  iconLeft: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 40,
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
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [editingField, setEditingField] = useState<'name' | null>(null);
  const [photo, setPhoto] = useState('https://i.pravatar.cc/150?img=3');
  const [loading, setLoading] = useState(true);
  const [showFullEmail, setShowFullEmail] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const user = auth().currentUser;
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const doc = await firestore().collection('users').doc(userId).get();
        if (doc.exists()) {
          const data = doc.data();
          setFullName(data?.fullname || '');
          setPhoto(data?.avatar || 'https://i.pravatar.cc/150?img=3');
          setEmail(user?.email || '');
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Chọn ảnh từ thư viện ảnh trên thiết bị
  const pickFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      async (response) => {
        setImageModalVisible(false);
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Lỗi', 'Không thể mở thư viện ảnh');
          return;
        }
        const uri = response.assets?.[0]?.uri;
        if (uri && userId) {
          setPhoto(uri);
          try {
            await firestore().collection('users').doc(userId).update({ avatar: uri });
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật ảnh đại diện');
          }
        }
      },
    );
  };

  const openGooglePhotos = async () => {
    setImageModalVisible(false);

    const googlePhotosUrlScheme = Platform.select({
      ios: 'photos-redirect://',
      android: 'com.google.android.apps.photos',
    });

    if (!googlePhotosUrlScheme) {
      Alert.alert('Lỗi', 'Không có URL hợp lệ để mở Google Photos.');
      return;
    }

    if (Platform.OS === 'ios') {
      try {
        const supported = await Linking.canOpenURL(googlePhotosUrlScheme);
        if (supported) {
          await Linking.openURL(googlePhotosUrlScheme);
          Alert.alert(
            'Thông báo',
            'Vui lòng chọn ảnh trong Google Photos rồi tải lên ứng dụng.',
          );
        } else {
          Alert.alert('Thông báo', 'Không tìm thấy Google Photos trên thiết bị.');
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể mở Google Photos.');
      }
    } else if (Platform.OS === 'android') {
      Alert.alert(
        'Thông báo',
        'Vui lòng mở Google Photos và chọn ảnh, sau đó tải lên ứng dụng.',
      );
    }
  };

  // Lưu thay đổi fullname khi nhấn icon check
  const handleFieldUpdate = async () => {
    if (!userId) return;

    try {
      await firestore().collection('users').doc(userId).update({
        fullname: fullName,
      });

      Alert.alert('Thành công', 'Thông tin đã được cập nhật');
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    } finally {
      setEditingField(null);
    }
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    if (name.length <= 2) return `${name[0]}******@${domain}`;
    return `${name[0]}******${name[name.length - 1]}@${domain}`;
  };

  // const handleLogout = async () => {
  //   try {
  //     await auth().signOut();
  //   } catch (error) {
  //     Alert.alert('Lỗi', 'Không thể đăng xuất');
  //   }
  // };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileBox}>
        <TouchableOpacity onPress={() => setImageModalVisible(true)}>
          <Image source={{ uri: photo }} style={styles.avatar} />
        </TouchableOpacity>

        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.label}>Họ tên</Text>

            {/* Nút edit/check đổi theo trạng thái chỉnh sửa */}
            <TouchableOpacity
              onPress={() => {
                if (editingField === 'name') {
                  handleFieldUpdate();
                } else {
                  setEditingField('name');
                }
              }}
            >
              <Icon
                name={editingField === 'name' ? 'check' : 'edit'}
                size={20}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>

          {editingField === 'name' ? (
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              autoFocus
            />
          ) : (
            <Text style={styles.value}>{fullName}</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <TouchableOpacity onPress={() => setShowFullEmail(!showFullEmail)}>
              <Icon
                name={showFullEmail ? 'visibility-off' : 'visibility'}
                size={20}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.value}>
            {showFullEmail ? email : maskEmail(email)}
          </Text>
        </View>
      </View>

      {/* <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity> */}

      {/* Modal chọn nguồn ảnh */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn nguồn ảnh</Text>
              <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Pressable style={styles.modalButton} onPress={pickFromGallery}>
              <Text style={styles.modalButtonText}>Thư viện ảnh</Text>
            </Pressable>

            <Pressable style={styles.modalButton} onPress={openGooglePhotos}>
              <Text style={styles.modalButtonText}>Google Photos</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    paddingVertical: 4,
    marginBottom: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
    borderRadius: 0.5,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});
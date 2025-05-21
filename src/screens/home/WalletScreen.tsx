import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useFocusEffect} from '@react-navigation/native';
import LoadingModal from '../../modals/LoadingModal';
import { useTheme } from '../../constants/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const walletNameIcons: Record<string, string> = {
  'mua sắm': 'tshirt-crew',
  'đi lại': 'motorbike',
  'ăn sáng': 'hamburger',
  'ăn trưa': 'hamburger',
  'ăn tối': 'hamburger',
  'ăn chiều': 'hamburger',
  'ăn nhẹ': 'hamburger',
  'xe buýt': 'bus',
  'taxi': 'car',
  'xe máy': 'motorbike',
  'ô tô': 'car',
  'quần áo': 'tshirt-crew',
  'giày dép': 'shoe-formal',
  'mỹ phẩm': 'lipstick',
  'sức khoẻ': 'medical-bag',
  'khám bệnh': 'medical-bag',
  'thuốc': 'pill',
  'giải trí': 'gamepad-variant',
  'xem phim': 'movie',
  'ca nhạc': 'music',
  'thể thao': 'badminton',
  'bóng đá': 'soccer',
  'cầu lông': 'badminton',
  'bơi lội': 'swim',
  'điện tử': 'cellphone',
  'điện thoại': 'cellphone',
  'laptop': 'laptop',
  'máy tính bảng': 'tablet',
  'giáo dục': 'book-open-page-variant',
  'học phí': 'book-open-page-variant',
  'sách vở': 'book',
  'du lịch': 'airplane',
  'khách sạn': 'bed',
  'vé máy bay': 'airplane',
  'thú cưng': 'dog',
  'chó': 'dog',
  'mèo': 'cat',
  'lương': 'cash',
  'tiết kiệm': 'piggy-bank',
  'tiền lãi': 'bank',
  'quà tặng': 'gift',
  'y tế': 'hospital-box',
  'gia đình': 'account-group',
  'internet': 'wifi',
  'điện nước': 'flash',
  'cafe / trà sữa': 'coffee',
  'sách / tài liệu': 'book',
  'trang trí nhà': 'sofa',
  'khác': 'dots-horizontal',
};

function getWalletIcon(name = '', iconProp: string | undefined) {
  if (iconProp) return iconProp;
  const key = name.trim().toLowerCase();
  return walletNameIcons[key] || walletNameToIcon(name);
}

const walletNameToIcon = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('ngân hàng') || lower.includes('bank')) return 'bank';
  if (lower.includes('thẻ') || lower.includes('card')) return 'credit-card';
  if (lower.includes('momo')) return 'cellphone';
  if (lower.includes('paypal')) return 'paypal';
  if (lower.includes('tiết kiệm') || lower.includes('saving')) return 'piggy-bank';
  if (lower.includes('tiền mặt') || lower.includes('cash')) return 'wallet';
  if (lower.includes('zalo')) return 'chat';
  if (lower.includes('đầu tư') || lower.includes('investment')) return 'finance';
  return 'wallet';
};

const WalletScreen = () => {
  const { colors, theme } = useTheme();
  const [walletName, setWalletName] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<
    {id: string; name: string; balance: number; currency: string; icon?: string}[]
  >([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any>(null);

  const formatNumberWithCommas = (value: string) => {
    const numberOnly = value.replace(/[^0-9]/g, '');
    if (!numberOnly) return '';
    return parseInt(numberOnly, 10).toLocaleString('en-US');
  };

  const fetchWallets = async () => {
    setLoadingWallets(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
        return;
      }
      const userId = currentUser.uid;
      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('wallets')
        .orderBy('createdAt', 'desc')
        .get();

      const walletList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          name: data.name,
          balance: data.balance,
          currency: data.currency,
          icon: data.icon,
        };
      });
      setWallets(walletList);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải danh sách ví.');
    } finally {
      setLoadingWallets(false);
    }
  };

  // Thay vì chỉ dùng useEffect, dùng useFocusEffect để load lại ví mỗi khi màn hình focus
  useFocusEffect(
    useCallback(() => {
      fetchWallets();
    }, []),
  );

  const onCreateWallet = async () => {
    if (!walletName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên ví.');
      return;
    }

    const balanceNumber = Number(initialBalance.replace(/,/g, ''));
    if (isNaN(balanceNumber) || balanceNumber < 0) {
      Alert.alert('Lỗi', 'Số dư không hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
        return;
      }

      const userId = currentUser.uid;

      const walletsSnapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('wallets')
        .where('name', '==', walletName.trim())
        .get();

      if (!walletsSnapshot.empty) {
        Alert.alert('Lỗi', 'Tên ví đã tồn tại.');
        return;
      }

      const newWalletRef = firestore()
        .collection('users')
        .doc(userId)
        .collection('wallets')
        .doc();

      const walletData = {
        id: newWalletRef.id,
        name: walletName.trim(),
        currency,
        balance: balanceNumber,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await newWalletRef.set(walletData);

      Alert.alert('Thành công', 'Ví mới đã được tạo.');
      setWalletName('');
      setInitialBalance('');
      await fetchWallets();
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tạo ví mới.');
    } finally {
      setLoading(false);
    }
  };

  const onDeleteWallet = (walletId: string) => {
    Alert.alert('Xoá ví', 'Bạn có chắc muốn xoá ví này?', [
      {text: 'Huỷ'},
      {
        text: 'Xoá',
        onPress: async () => {
          try {
            const currentUser = auth().currentUser;
            if (!currentUser) return;

            const walletRef = firestore()
              .collection('users')
              .doc(currentUser.uid)
              .collection('wallets')
              .doc(walletId);

            const walletDoc = await walletRef.get();
            if (!walletDoc.exists) return;

            // Chuyển vào "thùng rác"
            const trashRef = firestore()
              .collection('users')
              .doc(currentUser.uid)
              .collection('trashWallets')
              .doc(walletId);

            await trashRef.set({
              ...walletDoc.data(),
              deletedAt: firestore.FieldValue.serverTimestamp(),
            });

            // Xóa ví khỏi danh sách chính
            await walletRef.delete();

            await fetchWallets();
          } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể xoá ví.');
          }
        },
      },
    ]);
  };

  // Ví dụ hàm khôi phục ví từ thùng rác
  const onRestoreWallet = async (walletId: string) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const trashRef = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('trashWallets')
        .doc(walletId);

      const walletData = (await trashRef.get()).data();
      if (!walletData) return;

      const walletRef = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('wallets')
        .doc(walletId);

      await walletRef.set({
        ...walletData,
        deletedAt: firestore.FieldValue.delete(), // nếu cần loại bỏ trường này
      });

      await trashRef.delete();

      Alert.alert('Thành công', 'Ví đã được khôi phục.');
      await fetchWallets();
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể khôi phục ví.');
    }
  };

  const openEditModal = (wallet: any) => {
    setEditingWallet(wallet);
    setEditModalVisible(true);
  };

  const onSaveEdit = async () => {
    if (!editingWallet?.name || isNaN(Number(editingWallet?.balance))) {
      Alert.alert('Lỗi', 'Tên ví hoặc số dư không hợp lệ.');
      return;
    }

    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('wallets')
        .doc(editingWallet.id)
        .update({
          name: editingWallet.name,
          balance: Number(editingWallet.balance),
        });
      setEditModalVisible(false);
      await fetchWallets();
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể cập nhật ví.');
    }
  };

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Tạo Ví</Text>

      <Text style={[styles.label, { color: colors.text }]}>Tên ví</Text>
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
          color: colors.text,
          borderColor: theme === 'dark' ? '#444' : '#ccc'
        }]}
        placeholder="Nhập tên ví"
        placeholderTextColor={theme === 'dark' ? '#666' : '#999'}
        value={walletName}
        onChangeText={setWalletName}
      />

      <Text style={[styles.label, { color: colors.text }]}>Loại tiền tệ</Text>
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
          color: colors.text,
          borderColor: theme === 'dark' ? '#444' : '#ccc'
        }]}
        placeholder="VD: VND, USD"
        placeholderTextColor={theme === 'dark' ? '#666' : '#999'}
        value={currency}
        onChangeText={setCurrency}
      />

      <Text style={[styles.label, { color: colors.text }]}>Số dư ban đầu</Text>
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
          color: colors.text,
          borderColor: theme === 'dark' ? '#444' : '#ccc'
        }]}
        placeholder="Số tiền"
        placeholderTextColor={theme === 'dark' ? '#666' : '#999'}
        value={initialBalance}
        keyboardType="numeric"
        onChangeText={text => {
          const formatted = formatNumberWithCommas(text);
          setInitialBalance(formatted);
        }}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onCreateWallet}
        disabled={loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Tạo ví</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 30, color: colors.text }]}>Tổng số dư của các ví</Text>
      <Text style={[styles.totalBalance, { color: '#4CAF50' }]}>
        {totalBalance.toLocaleString('en-US')} {currency}
      </Text>

      <Text style={[styles.label, { marginTop: 20, color: colors.text }]}>Danh sách ví</Text>

      {loadingWallets ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView style={{maxHeight: 250}}>
          {wallets.length === 0 ? (
            <Text style={{ color: colors.text }}>Chưa có ví nào.</Text>
          ) : (
            wallets.map(wallet => (
              <TouchableOpacity
                key={wallet.id}
                onLongPress={() => onDeleteWallet(wallet.id)}
                onPress={() => openEditModal(wallet)}
                style={[
                  styles.walletItem,
                  {
                    marginBottom: 10,
                    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
                  },
                ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name={getWalletIcon(wallet.name, wallet.icon)} size={24} color={'#1976d2'} style={{ marginRight: 10 }} />
                  <Text style={[styles.walletName, { color: colors.text }]}>{wallet.name}</Text>
                </View>
                <Text style={[styles.walletBalance, { color: colors.text }]}> 
                  {wallet.balance.toLocaleString('en-US')} {wallet.currency}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Tên ví</Text>
            <TextInput
              style={styles.input}
              value={editingWallet?.name}
              onChangeText={name => setEditingWallet({...editingWallet, name})}
            />
            <Text style={styles.label}>Số dư</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(editingWallet?.balance)}
              onChangeText={balance =>
                setEditingWallet({
                  ...editingWallet,
                  balance: balance.replace(/[^0-9]/g, ''),
                })
              }
            />
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Text style={{marginRight: 20, color: 'red'}}>Huỷ</Text>
              </Pressable>
              <Pressable onPress={onSaveEdit}>
                <Text style={{color: 'blue'}}>Lưu</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <LoadingModal visible={loading} />
    </View>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  totalBalance: {
    fontSize: 20,
    fontWeight: '700',
    color: 'green',
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
});
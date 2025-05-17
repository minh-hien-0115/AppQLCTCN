import React, { useState, useEffect } from 'react';
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
import LoadingModal from '../../modals/LoadingModal';

const WalletScreen = () => {
  const [walletName, setWalletName] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<
    { id: string; name: string; balance: number; currency: string }[]
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

  useEffect(() => {
    fetchWallets();
  }, []);

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
      { text: 'Huỷ' },
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

            // Kiểm tra xem ví có thực sự bị xoá
            const checkDeleted = await walletRef.get();
            if (checkDeleted.exists()) {
              console.warn('Ví chưa được xoá hoàn toàn.');
            }

            await fetchWallets();
          } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể xoá ví.');
          }
        },
      },
    ]);
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
    <View style={styles.container}>
      <Text style={styles.title}>Tạo Ví</Text>

      <Text style={styles.label}>Tên ví</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên ví"
        value={walletName}
        onChangeText={setWalletName}
      />

      <Text style={styles.label}>Loại tiền tệ</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: VND, USD"
        value={currency}
        onChangeText={setCurrency}
      />

      <Text style={styles.label}>Số dư ban đầu</Text>
      <TextInput
        style={styles.input}
        placeholder="Số tiền"
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
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Tạo ví</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 30 }]}>Tổng số dư của các ví</Text>
      <Text style={styles.totalBalance}>
        {totalBalance.toLocaleString('en-US')} {currency}
      </Text>

      <Text style={[styles.label, { marginTop: 20 }]}>Danh sách ví</Text>

      {loadingWallets ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView style={{ maxHeight: 250 }}>
          {wallets.length === 0 ? (
            <Text>Chưa có ví nào.</Text>
          ) : (
            wallets.map(wallet => (
              <TouchableOpacity
                key={wallet.id}
                onLongPress={() => onDeleteWallet(wallet.id)}
                onPress={() => openEditModal(wallet)}
                style={styles.walletItem}
              >
                <Text style={styles.walletName}>{wallet.name}</Text>
                <Text style={styles.walletBalance}>
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
              onChangeText={name =>
                setEditingWallet({ ...editingWallet, name })
              }
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
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Text style={{ marginRight: 20, color: 'red' }}>Huỷ</Text>
              </Pressable>
              <Pressable onPress={onSaveEdit}>
                <Text style={{ color: 'blue' }}>Lưu</Text>
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
  container: { flex: 1, paddingHorizontal: 10, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 6 },
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
    backgroundColor: '#7da3cc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  walletName: {
    fontSize: 16,
    fontWeight: '500',
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalBalance: {
    fontSize: 18,
    fontWeight: '700',
    color: 'green',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
});
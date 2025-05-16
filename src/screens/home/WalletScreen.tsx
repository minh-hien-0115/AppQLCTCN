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
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import LoadingModal from '../../modals/LoadingModal';

const WalletScreen = () => {
  const [walletName, setWalletName] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<{ id: string; name: string; balance: number; currency: string }[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);

  // Hàm định dạng số có dấu phẩy
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
        setLoadingWallets(false);
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
          id: doc.id,
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
        setLoading(false);
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
        Alert.alert('Lỗi', 'Tên ví đã tồn tại. Vui lòng chọn tên khác.');
        setLoading(false);
        return;
      }

      await firestore()
        .collection('users')
        .doc(userId)
        .collection('wallets')
        .add({
          name: walletName.trim(),
          currency,
          balance: balanceNumber,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert('Thành công', 'Ví mới đã được tạo.');
      setWalletName('');
      setInitialBalance('');
      
      // Tải lại danh sách ví mới nhất
      fetchWallets();
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tạo ví mới.');
    } finally {
      setLoading(false);
    }
  };

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
        onChangeText={(text) => {
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

      <Text style={[styles.label, { marginTop: 30, marginBottom: 10 }]}>Danh sách ví</Text>

      {loadingWallets ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView style={{ maxHeight: 250, borderTopWidth: 1, borderColor: '#ccc', paddingTop: 10 }}>
          {wallets.length === 0 ? (
            <Text>Chưa có ví nào.</Text>
          ) : (
            wallets.map(wallet => (
              <View key={wallet.id} style={styles.walletItem}>
                <Text style={styles.walletName}>{wallet.name}</Text>
                <Text style={styles.walletBalance}>
                  {wallet.balance.toLocaleString('en-US')} {wallet.currency}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

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
});
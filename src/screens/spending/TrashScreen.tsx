import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const TrashScreen = () => {
  const [trashWallets, setTrashWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrashWallets = async () => {
    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const snapshot = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('trashWallets')
        .orderBy('deletedAt', 'desc')
        .get();

      const wallets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTrashWallets(wallets);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải danh sách ví đã xoá.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashWallets();
  }, []);

  const onRestoreWallet = async (wallet: any) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const walletId = wallet.id;

      const walletRef = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('wallets')
        .doc(walletId);

      const trashRef = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('trashWallets')
        .doc(walletId);

      const walletData = {
        id: walletId,
        name: wallet.name,
        currency: wallet.currency || 'VND',
        balance: wallet.balance || 0,
        createdAt: wallet.createdAt || firestore.FieldValue.serverTimestamp(),
      };

      await walletRef.set(walletData);
      await trashRef.delete();

      Alert.alert('Khôi phục thành công', `Ví "${wallet.name}" đã được khôi phục.`);
      await fetchTrashWallets();
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể khôi phục ví.');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : trashWallets.length === 0 ? (
        <Text style={{ marginTop: 20 }}>Không có ví nào trong thùng rác.</Text>
      ) : (
        <ScrollView>
          {trashWallets.map(wallet => (
            <View key={wallet.id} style={styles.walletItem}>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName} numberOfLines={1} ellipsizeMode="tail">
                  {wallet.name}
                </Text>
                <Text style={styles.walletText}>
                  {wallet.balance?.toLocaleString('en-US')} {wallet.currency}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onRestoreWallet(wallet)}
                style={styles.restoreButton}
                activeOpacity={0.7}
              >
                <Text style={styles.restoreText}>Khôi phục</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default TrashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 10,
    maxWidth: 150,
  },
  walletText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  restoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    backgroundColor: 'rgba(0,122,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  restoreText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
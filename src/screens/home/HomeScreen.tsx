import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AvatarComponents } from '../../components';
import { useTheme } from '../../constants/ThemeContext';

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=3';

const HomeScreen = () => {
  const { colors } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string>(DEFAULT_AVATAR);
  const [transactionDetailModalVisible, setTransactionDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      setDisplayName('Người dùng');
      setLoading(false);
      return;
    }

    firestore()
      .collection('users')
      .doc(userId)
      .get()
      .then(docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setDisplayName(data?.fullname || 'Người dùng');
          setAvatarUri(data?.avatar || DEFAULT_AVATAR);
        } else {
          setDisplayName('Người dùng');
          setAvatarUri(DEFAULT_AVATAR);
        }
      })
      .catch(error => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        setDisplayName('Người dùng');
        setAvatarUri(DEFAULT_AVATAR);
      });

    const unsubscribeWallets = firestore()
      .collection('users')
      .doc(userId)
      .collection('wallets')
      .onSnapshot(snapshot => {
        const walletList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setWallets(walletList);

        if (walletList.length === 1) {
          setSelectedWallet(walletList[0]);
          setWalletModalVisible(false);
        }

        if (walletList.length > 1 && !selectedWallet) {
          setWalletModalVisible(true);
        }

        if (
          selectedWallet &&
          !walletList.some(w => w.id === selectedWallet.id)
        ) {
          setSelectedWallet(null);
          setWalletModalVisible(true);
        }
      });

    return () => unsubscribeWallets();
  }, [userId]);

  useEffect(() => {
    if (!userId || !selectedWallet) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .collection('wallets')
      .doc(selectedWallet.id)
      .collection('transactions')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [userId, selectedWallet]);

  const totalIncome = transactions
    .filter(item => item.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(item => item.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ';
  };

  //Xóa giao dịch
  const deleteTransaction = async (transactionId: string) => {
    if (!userId || !selectedWallet) return;
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('wallets')
        .doc(selectedWallet.id)
        .collection('transactions')
        .doc(transactionId)
        .delete();

      // Cập nhật lại số dư ví
      const deletedTransaction = transactions.find(t => t.id === transactionId);
      if (!deletedTransaction) return;

      let newBalance = selectedWallet.balance;
      if (deletedTransaction.type === 'income') {
        newBalance -= deletedTransaction.amount;
      } else {
        newBalance += deletedTransaction.amount;
      }

      await firestore()
        .collection('users')
        .doc(userId)
        .collection('wallets')
        .doc(selectedWallet.id)
        .update({ balance: newBalance });

      Alert.alert('Thành công', 'Giao dịch đã được xóa.');
    } catch (error) {
      console.error('Lỗi khi xóa giao dịch:', error);
      Alert.alert('Lỗi', 'Không thể xóa giao dịch.');
    }
  };

  const renderTransaction = ({item}: {item: any}) => {
    const color = item.type === 'income' ? '#4caf50' : '#f44336';

    return (
      <Pressable
        onPress={() => {
          setSelectedTransaction(item);
          setTransactionDetailModalVisible(true);
        }}
        onLongPress={() => {
          Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn xóa giao dịch này không?',
            [
              {
                text: 'Hủy',
                style: 'cancel',
              },
              {
                text: 'Xóa',
                style: 'destructive',
                onPress: () => deleteTransaction(item.id),
              },
            ],
            { cancelable: true }
          );
        }}
        style={styles.transactionItem}>
        <Icon
          name={item.icon || 'wallet'}
          size={26}
          color={color}
          style={{marginRight: 12}}
        />
        <View style={{flex: 1}}>
          <Text style={styles.category}>{item.category}</Text>
          {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
        </View>
        <Text style={[styles.amount, {color}]}>
          {item.type === 'income' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Text>
      </Pressable>
    );
  };

  if (!selectedWallet && wallets.length > 1) {
    return (
      <View style={styles.container}>
        <Modal visible={walletModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn ví để tiếp tục</Text>
              </View>
              {wallets.map(wallet => (
                <Pressable
                  key={wallet.id}
                  style={styles.walletItem}
                  onPress={() => {
                    setSelectedWallet(wallet);
                    setWalletModalVisible(false);
                  }}>
                  <Text style={styles.walletName}>{wallet.name}</Text>
                  <Text>{formatCurrency(wallet.balance)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.welcomeRow}>
        <Text style={styles.welcome}>Xin chào, {displayName}</Text>
        <AvatarComponents uri={avatarUri} />
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>
            Số dư hiện tại của {selectedWallet?.name ?? 'Ví'}
          </Text>
          <TouchableOpacity onPress={() => setWalletModalVisible(true)}>
            <Icon name="dots-vertical" size={22} color="#555" />
          </TouchableOpacity>
        </View>
        <Text style={styles.balance}>
          {selectedWallet
            ? formatCurrency(selectedWallet.balance)
            : formatCurrency(0)}
        </Text>

        <View style={styles.row}>
          <View style={styles.box}>
            <View style={styles.incomeRow}>
              <Text style={styles.incomeLabel}>Thu nhập</Text>
              <Icon
                name="arrow-up-bold"
                size={18}
                color="#4caf50"
                style={{marginLeft: 6}}
              />
            </View>
            <Text style={styles.income}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={styles.box}>
            <View style={styles.expenseRow}>
              <Text style={styles.expenseLabel}>Chi tiêu</Text>
              <Icon
                name="arrow-down-bold"
                size={18}
                color="#f44336"
                style={{marginLeft: 6}}
              />
            </View>
            <Text style={styles.expense}>{formatCurrency(totalExpense)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1e90ff" />
      ) : transactions.length === 0 ? (
        <View style={{alignItems: 'center', marginTop: 30}}>
          <Text style={{fontSize: 16, color: '#888'}}>Không có dữ liệu</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={{paddingBottom: 20}}
        />
      )}

      {/* Modal chọn ví */}
      <Modal
        visible={walletModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWalletModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ví</Text>
              <TouchableOpacity onPress={() => setWalletModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {wallets.length === 0 ? (
              <Text style={{textAlign: 'center', marginTop: 10}}>
                Không có ví nào.
              </Text>
            ) : (
              wallets.map(wallet => (
                <Pressable
                  key={wallet.id}
                  style={styles.walletItem}
                  onPress={() => {
                    setSelectedWallet(wallet);
                    setWalletModalVisible(false);
                  }}>
                  <Text style={styles.walletName}>{wallet.name}</Text>
                  <Text>{formatCurrency(wallet.balance)}</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </Modal>

      {/* Modal chi tiết giao dịch */}
      <Modal
        visible={transactionDetailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTransactionDetailModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {maxHeight: '50%'}]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết giao dịch</Text>
              <TouchableOpacity
                onPress={() => setTransactionDetailModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {selectedTransaction ? (
              <View style={{paddingHorizontal: 10}}>
                <Text style={{fontWeight: '600', fontSize: 16, marginBottom: 8}}>
                  Danh mục: {selectedTransaction.category}
                </Text>
                <Text style={{marginBottom: 6}}>
                  Số tiền:{' '}
                  <Text style={{color: selectedTransaction.type === 'income' ? '#4caf50' : '#f44336'}}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(selectedTransaction.amount)}
                  </Text>
                </Text>
                {selectedTransaction.note ? (
                  <Text style={{marginBottom: 6}}>
                    Ghi chú: {selectedTransaction.note}
                  </Text>
                ) : null}
                <Text style={{marginBottom: 6}}>
                  Loại: {selectedTransaction.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                </Text>
                {selectedTransaction.createdAt ? (
                  <Text>
                    Thời gian:{' '}
                    {selectedTransaction.createdAt.toDate
                      ? selectedTransaction.createdAt.toDate().toLocaleString()
                      : new Date(selectedTransaction.createdAt).toLocaleString()}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text>Không có dữ liệu giao dịch</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
  },
  welcome: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: '48%',
  },
  incomeLabel: {
    fontSize: 14,
    color: '#4caf50',
  },
  income: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
  },
  expenseLabel: {
    fontSize: 14,
    color: '#f44336',
  },
  expense: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f44336',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  note: {
    fontSize: 13,
    color: '#888',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  walletName: {
    fontSize: 16,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
});
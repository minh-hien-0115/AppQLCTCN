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
import ChatBot from '../../components/ChatBot';

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=3';

const categoryIcons: Record<string, string> = {
  'Ăn uống': 'hamburger',
  'Ăn sáng': 'hamburger',
  'Ăn trưa': 'hamburger',
  'Ăn tối': 'hamburger',
  'Ăn chiều': 'hamburger',
  'Ăn nhẹ': 'hamburger',
  'Đi lại': 'motorbike',
  'Xe buýt': 'bus',
  'Taxi': 'car',
  'Xe máy': 'motorbike',
  'Ô tô': 'car',
  'Mua sắm': 'tshirt-crew',
  'Quần áo': 'tshirt-crew',
  'Giày dép': 'shoe-formal',
  'Mỹ phẩm': 'lipstick',
  'Sức khoẻ': 'medical-bag',
  'Khám bệnh': 'medical-bag',
  'Thuốc': 'pill',
  'Giải trí': 'gamepad-variant',
  'Xem phim': 'movie',
  'Ca nhạc': 'music',
  'Thể thao': 'badminton',
  'Bóng đá': 'soccer',
  'Cầu lông': 'badminton',
  'Bơi lội': 'swim',
  'Điện tử': 'cellphone',
  'Điện thoại': 'cellphone',
  'Laptop': 'laptop',
  'Máy tính bảng': 'tablet',
  'Giáo dục': 'book-open-page-variant',
  'Học phí': 'book-open-page-variant',
  'Sách vở': 'book',
  'Du lịch': 'airplane',
  'Khách sạn': 'bed',
  'Vé máy bay': 'airplane',
  'Thú cưng': 'dog',
  'Chó': 'dog',
  'Mèo': 'cat',
  'Lương': 'cash',
  'Tiết kiệm': 'piggy-bank',
  'Tiền lãi': 'bank',
  'Quà tặng': 'gift',
  'Y tế': 'hospital-box',
  'Gia đình': 'account-group',
  'Internet': 'wifi',
  'Điện nước': 'flash',
  'Cafe / Trà sữa': 'coffee',
  'Sách / Tài liệu': 'book',
  'Trang trí nhà': 'sofa',
  'Khác': 'dots-horizontal',
};

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
  return walletNameIcons[key] || 'wallet';
}

const HomeScreen = ({ navigation }: any) => {
  const { colors, theme } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string>(DEFAULT_AVATAR);
  const [transactionDetailModalVisible, setTransactionDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
    const itemStyle = [
      styles.transactionItem,
      item.type === 'income' ? styles.transactionIncome : styles.transactionExpense
    ];
    const iconName = categoryIcons[item.category] || 'wallet';
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
        style={itemStyle}>
        <Icon
          name={iconName}
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
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name={getWalletIcon(wallet.name, wallet.icon)} size={20} color="#1976d2" style={{marginRight: 8}} />
                    <Text style={styles.walletName}>{wallet.name}</Text>
                  </View>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.welcomeRow}>
        <Text style={[styles.welcome, { color: colors.text }]}>Xin chào, {displayName}</Text>
        <AvatarComponents uri={avatarUri} size={40} />
      </View>

      <View style={[styles.summaryBox, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
        <View style={styles.headerRow}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name={selectedWallet?.icon || 'wallet'} size={20} color={colors.text} style={{marginRight: 6}} />
            <Text style={[styles.label, { color: colors.text }]}> 
              Số dư hiện tại của {selectedWallet?.name ?? 'Ví'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setWalletModalVisible(true)}>
            <Icon name="dots-vertical" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.balance, { color: colors.text }]}>
          {selectedWallet
            ? formatCurrency(selectedWallet.balance)
            : formatCurrency(0)}
        </Text>

        <View style={styles.row}>
          <View style={[styles.box, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5', borderColor: '#4caf50' }]}> 
            <View style={styles.incomeRow}>
              <Icon name="cash" size={22} color="#4caf50" style={{marginRight: 6}} />
              <Text style={[styles.incomeLabel, { color: colors.text }]}>Thu nhập</Text>
              <Icon
                name="arrow-up-bold"
                size={22}
                color="#4caf50"
                style={{marginLeft: 8}}
              />
            </View>
            <Text style={[styles.income, { color: '#4caf50' }]}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={[styles.box, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5', borderColor: '#f44336' }]}> 
            <View style={styles.expenseRow}>
              <Icon name="cash-remove" size={22} color="#f44336" style={{marginRight: 6}} />
              <Text style={[styles.expenseLabel, { color: colors.text }]}>Chi tiêu</Text>
              <Icon
                name="arrow-down-bold"
                size={22}
                color="#f44336"
                style={{marginLeft: 8}}
              />
            </View>
            <Text style={[styles.expense, { color: '#f44336' }]}>{formatCurrency(totalExpense)}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Giao dịch gần đây</Text>

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
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name={getWalletIcon(wallet.name, wallet.icon)} size={20} color="#1976d2" style={{marginRight: 8}} />
                    <Text style={styles.walletName}>{wallet.name}</Text>
                  </View>
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
                <Text style={{fontWeight: '600', fontSize: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', display: 'flex'}}>
                  Danh mục: 
                  <Icon
                    name={categoryIcons[selectedTransaction.category] || 'wallet'}
                    size={20}
                    color={'#1976d2'}
                    style={{marginRight: 6, marginLeft: 4, top: 2}}
                  />
                  {selectedTransaction.category}
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

      {/* Nút chat nổi */}
      <TouchableOpacity style={styles.chatIcon} onPress={() => setIsChatOpen(true)}>
        <Icon name="robot-outline" size={28} color="#1976d2" />
      </TouchableOpacity>
      {isChatOpen && (
        <View style={styles.floatingChatBox}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setIsChatOpen(false)}>
            <Icon name="close" size={22} color="#333" />
          </TouchableOpacity>
          <ChatBot />
        </View>
      )}
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
    borderWidth: 2,
    borderColor: '#1976d2',
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
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '48%',
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  incomeLabel: {
    fontSize: 17,
    color: '#4caf50',
  },
  income: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4caf50',
  },
  expenseLabel: {
    fontSize: 17,
    color: '#f44336',
  },
  expense: {
    fontSize: 20,
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
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 2,
  },
  transactionIncome: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  transactionExpense: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
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
  chatIcon: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 12,
    elevation: 5,
    zIndex: 100,
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  floatingChatBox: {
    position: 'absolute',
    bottom: 20,
    right: '1%',
    width: '98%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 28,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    padding: 10,
    zIndex: 200,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: '#eee',
    borderRadius: 16,
    padding: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  sendButtonDisabled: {
    borderColor: '#ccc',
  },
});
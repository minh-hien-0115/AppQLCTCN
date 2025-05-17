import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  ScrollView,
  Pressable,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {ArrowDown2, CloseCircle} from 'iconsax-react-nativejs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const incomeCategories = [
  {name: 'Lương', icon: 'cash'},
  {name: 'Thưởng', icon: 'gift'},
  {name: 'Kinh doanh', icon: 'briefcase'},
  {name: 'Đầu tư', icon: 'chart-line'},
  {name: 'Tiết kiệm', icon: 'piggy-bank'},
];

const expenseCategories = [
  {name: 'Ăn uống', icon: 'silverware-fork-knife'},
  {name: 'Cafe / Trà sữa', icon: 'coffee'},
  {name: 'Mua sắm', icon: 'shopping'},
  {name: 'Giải trí', icon: 'gamepad-variant'},
  {name: 'Điện nước', icon: 'flash'},
  {name: 'Internet', icon: 'wifi'},
  {name: 'Thuê nhà', icon: 'home-city'},
  {name: 'Di chuyển', icon: 'bus'},
  {name: 'Xăng xe', icon: 'gas-station'},
  {name: 'Sửa xe', icon: 'tools'},
  {name: 'Y tế', icon: 'hospital-box'},
  {name: 'Bảo hiểm', icon: 'shield-check'},
  {name: 'Giáo dục', icon: 'school'},
  {name: 'Con cái', icon: 'baby-face'},
  {name: 'Gia đình', icon: 'account-group'},
  {name: 'Quà tặng', icon: 'gift-outline'},
  {name: 'Du lịch', icon: 'airplane'},
  {name: 'Từ thiện', icon: 'hand-heart'},
  {name: 'Khác', icon: 'dots-horizontal'},
];

const categories = [...incomeCategories, ...expenseCategories];

const recurrenceOptions = [
  {label: 'Không lặp lại', value: 'none'},
  {label: 'Hàng ngày', value: 'daily'},
  {label: 'Hàng tuần', value: 'weekly'},
  {label: 'Hàng tháng', value: 'monthly'},
];

const AddScreen = () => {
  const [wallets, setWallets] = useState<{ id: string; name: string; icon?: string; balance?: number }[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [modalWalletVisible, setModalWalletVisible] = useState(false);
  const [type, setType] = useState<'income' | 'expense' | ''>('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [recurrenceDay, setRecurrenceDay] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRecurrenceVisible, setModalRecurrenceVisible] = useState(false);
  const [modalRecurrenceDayVisible, setModalRecurrenceDayVisible] = useState(false);

  const daysInMonth = Array.from({length: 31}, (_, i) => i + 1);

  // Load danh sách ví của ng dùng
  const fetchWallets = useCallback(async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const snapshot = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('wallets')
        .get();

      const walletsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as {id: string; name: string; icon?: string}[];

      setWallets(walletsData);

      if (selectedWalletId && !walletsData.find(w => w.id === selectedWalletId)) {
        setSelectedWalletId(null);
      }

      if (walletsData.length === 1) {
        setSelectedWalletId(walletsData[0].id);
      } else if (!selectedWalletId && walletsData.length > 0) {
        // Nếu chưa chọn ví, lấy ví đầu tiên làm mặc định
        setSelectedWalletId(walletsData[0].id);
      }

    } catch (error) {
      console.error('Lỗi khi lấy ví:', error);
    }
  }, [selectedWalletId]);

  useEffect(() => {
    if (modalWalletVisible) {
      fetchWallets();
    }
  }, [modalWalletVisible, fetchWallets]);

  const onSave = async () => {
  if (!category.trim() || !amount.trim()) {
    Alert.alert('Lỗi', 'Vui lòng nhập danh mục và số tiền.');
    return;
  }

  if (!type || !icon) {
    Alert.alert('Lỗi', 'Danh mục không hợp lệ.');
    return;
  }

  if (!selectedWalletId) {
    Alert.alert('Lỗi', 'Vui lòng chọn ví để lưu giao dịch.');
    return;
  }

  const amountNumber = Number(amount.replace(/,/g, ''));
  if (isNaN(amountNumber) || amountNumber <= 0) {
    Alert.alert('Lỗi', 'Số tiền không hợp lệ.');
    return;
  }

  const tagsArray = tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  if (recurrence === 'monthly' && !recurrenceDay) {
    Alert.alert('Lỗi', 'Vui lòng chọn ngày trong tháng để lặp lại.');
    return;
  }

  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
      return;
    }

    const userId = currentUser.uid;
    const walletRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('wallets')
      .doc(selectedWalletId);

    await firestore().runTransaction(async transaction => {
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists) {
        throw new Error('Ví không tồn tại');
      }

      const walletData = walletDoc.data() || {};
      const currentBalance = walletData.balance;

      if (typeof currentBalance !== 'number') {
        throw new Error('Số dư ví không hợp lệ hoặc chưa được khởi tạo.');
      }

      const expenseThreshold = walletData.expenseThreshold; // Lấy ngưỡng chi tiêu
      const newBalance =
        type === 'income'
          ? currentBalance + amountNumber
          : currentBalance - amountNumber;

      // Kiểm tra nếu là chi tiêu và có ngưỡng chi tiêu
      if (
        type === 'expense' &&
        typeof expenseThreshold === 'number' &&
        amountNumber > expenseThreshold
      ) {
        Alert.alert(
          'Cảnh báo',
          `Bạn đã chi tiêu vượt ngưỡng ${expenseThreshold.toLocaleString()} VNĐ.`
        );
        // Vẫn đc phép lưu giao dịch
      }

      // Tạo giao dịch mới
      const newTransactionRef = walletRef.collection('transactions').doc();
      transaction.set(newTransactionRef, {
        type,
        category,
        icon,
        amount: amountNumber,
        note,
        tags: tagsArray,
        recurrence,
        recurrenceDay,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Cập nhật số dư ví
      transaction.update(walletRef, { balance: newBalance });
    });

    // Reset form
    setCategory('');
    setAmount('');
    setNote('');
    setType('');
    setIcon('');
    setTags('');
    setRecurrence('none');
    setRecurrenceDay(null);
  } catch (error) {
    console.error('Lỗi khi lưu:', error);
    Alert.alert('Lỗi', 'Không thể thêm giao dịch.');
  }
};


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ios: 'padding', android: undefined})}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Thêm giao dịch</Text>

        {/* --- Chọn ví --- */}
        <TouchableOpacity
          style={[styles.input, styles.dropdown]}
          onPress={() => setModalWalletVisible(true)}>
          <Text>
            {' '}
            {selectedWalletId
              ? wallets.find(w => w.id === selectedWalletId)?.name
              : 'Chọn ví'}
          </Text>
          <ArrowDown2 size={20} color="#555" />
        </TouchableOpacity>

        {/* --- Chọn danh mục --- */}
        <TouchableOpacity
          style={[styles.input, styles.dropdown]}
          onPress={() => setModalVisible(true)}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {icon ? (
              <Icon
                name={icon}
                size={20}
                color="#555"
                style={{marginRight: 8}}
              />
            ) : null}
            <Text>{category || 'Chọn danh mục'}</Text>
          </View>
          <ArrowDown2 size={20} color="#555" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Số tiền"
          keyboardType="numeric"
          value={amount}
          onChangeText={text => {
            const raw = text.replace(/[^0-9]/g, '');
            const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            setAmount(formatted);
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="Ghi chú (tùy chọn)"
          value={note}
          onChangeText={setNote}
        />

        <TextInput
          style={styles.input}
          placeholder="Thêm thẻ (tags), cách nhau bằng dấu phẩy"
          value={tags}
          onChangeText={setTags}
        />

        <TouchableOpacity
          style={[styles.input, styles.dropdown]}
          onPress={() => setModalRecurrenceVisible(true)}>
          <Text>
            Tùy chọn lặp lại: {
              recurrenceOptions.find(o => o.value === recurrence)?.label || ''
            }
          </Text>
          <ArrowDown2 size={20} color="#555" />
        </TouchableOpacity>

        {recurrence === 'monthly' && (
          <TouchableOpacity
            style={[styles.input, styles.dropdown]}
            onPress={() => setModalRecurrenceDayVisible(true)}>
            <Text>
              Ngày trong tháng: {recurrenceDay ? recurrenceDay : 'Chọn ngày'}
            </Text>
            <ArrowDown2 size={20} color="#555" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={onSave}>
          <Text style={styles.buttonText}>Lưu</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal chọn ví */}
      <Modal
        visible={modalWalletVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalWalletVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalWalletVisible(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn ví</Text>
            {wallets.length === 0 ? (
              <Text style={{textAlign: 'center', marginVertical: 10}}>
                Không có ví nào. Vui lòng tạo ví trước.
              </Text>
            ) : (
              <FlatList
                data={wallets}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.walletItem,
                      selectedWalletId === item.id && styles.walletItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedWalletId(item.id);
                      setModalWalletVisible(false);
                    }}>
                    <Text
                      style={[
                        styles.walletItemText,
                        selectedWalletId === item.id && {color: '#fff'},
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Modal chọn danh mục */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn danh mục</Text>
            <ScrollView>
              <Text style={styles.categorySectionTitle}>Thu nhập</Text>
              {incomeCategories.map(cat => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryItem,
                    category === cat.name && styles.categoryItemSelected,
                  ]}
                  onPress={() => {
                    setCategory(cat.name);
                    setIcon(cat.icon);
                    setType('income');
                    setModalVisible(false);
                  }}>
                  <Icon name={cat.icon} size={20} style={{marginRight: 10}} />
                  <Text>{cat.name}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.categorySectionTitle}>Chi tiêu</Text>
              {expenseCategories.map(cat => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryItem,
                    category === cat.name && styles.categoryItemSelected,
                  ]}
                  onPress={() => {
                    setCategory(cat.name);
                    setIcon(cat.icon);
                    setType('expense');
                    setModalVisible(false);
                  }}>
                  <Icon name={cat.icon} size={20} style={{marginRight: 10}} />
                  <Text>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Modal chọn lặp lại */}
      <Modal
        visible={modalRecurrenceVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalRecurrenceVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalRecurrenceVisible(false)}>
          <View style={styles.modalContainer}>
            {recurrenceOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.recurrenceItem,
                  recurrence === opt.value && styles.recurrenceItemSelected,
                ]}
                onPress={() => {
                  setRecurrence(opt.value);
                  setRecurrenceDay(null);
                  setModalRecurrenceVisible(false);
                }}>
                <Text
                  style={[
                    recurrence === opt.value && {color: '#fff', fontWeight: 'bold'},
                  ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modal chọn ngày lặp lại trong tháng */}
      <Modal
        visible={modalRecurrenceDayVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalRecurrenceDayVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalRecurrenceDayVisible(false)}>
          <View style={styles.modalContainer}>
            <FlatList
              data={daysInMonth}
              keyExtractor={item => item.toString()}
              numColumns={7}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.dayItem,
                    recurrenceDay === item && styles.dayItemSelected,
                  ]}
                  onPress={() => {
                    setRecurrenceDay(item);
                    setModalRecurrenceDayVisible(false);
                  }}>
                  <Text
                    style={[
                      recurrenceDay === item && {color: '#fff', fontWeight: 'bold'},
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#fff'},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
  },
  modalTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 10},
  walletItem: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  walletItemSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  walletItemText: {
    fontSize: 16,
  },
  categorySectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryItemSelected: {
    backgroundColor: '#3b82f6',
  },
  recurrenceItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recurrenceItemSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dayItem: {
    flex: 1,
    margin: 4,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  dayItemSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
});
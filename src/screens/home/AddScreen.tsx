import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../constants/ThemeContext';

const incomeCategories = [
  { name: 'Lương', icon: 'cash' },
  { name: 'Thưởng', icon: 'gift' },
  { name: 'Kinh doanh', icon: 'briefcase' },
  { name: 'Đầu tư', icon: 'chart-line' },
  { name: 'Tiết kiệm', icon: 'piggy-bank' },
  { name: 'Tiền lãi', icon: 'bank' },
  { name: 'Bán hàng online', icon: 'shopping-outline' },
  { name: 'Cổ tức', icon: 'finance' },
  { name: 'Trợ cấp', icon: 'hand-heart' },
  { name: 'Bồi thường', icon: 'gavel' },
  { name: 'Tiền hoàn', icon: 'credit-card-refund' },
  { name: 'Thu nhập phụ', icon: 'cash-plus' },
  { name: 'Làm thêm', icon: 'clock-plus-outline' },
  { name: 'Tiền thưởng cổ phần', icon: 'chart-pie' },
  { name: 'Khác', icon: 'dots-horizontal' },
];

const expenseCategories = [
  { name: 'Ăn uống', icon: 'silverware-fork-knife' },
  { name: 'Cafe / Trà sữa', icon: 'coffee' },
  { name: 'Mua sắm', icon: 'shopping' },
  { name: 'Giải trí', icon: 'gamepad-variant' },
  { name: 'Điện nước', icon: 'flash' },
  { name: 'Internet', icon: 'wifi' },
  { name: 'Thuê nhà', icon: 'home-city' },
  { name: 'Di chuyển', icon: 'bus' },
  { name: 'Xăng xe', icon: 'gas-station' },
  { name: 'Sửa xe', icon: 'tools' },
  { name: 'Y tế', icon: 'hospital-box' },
  { name: 'Bảo hiểm', icon: 'shield-check' },
  { name: 'Giáo dục', icon: 'school' },
  { name: 'Con cái', icon: 'baby-face' },
  { name: 'Gia đình', icon: 'account-group' },
  { name: 'Quà tặng', icon: 'gift-outline' },
  { name: 'Du lịch', icon: 'airplane' },
  { name: 'Từ thiện', icon: 'hand-heart' },
  { name: 'Thuế', icon: 'file-document' },
  { name: 'Điện thoại', icon: 'cellphone' },
  { name: 'Thú cưng', icon: 'dog' },
  { name: 'Làm đẹp', icon: 'lipstick' },
  { name: 'Trang trí nhà', icon: 'sofa' },
  { name: 'Tiệc tùng', icon: 'glass-cocktail' },
  { name: 'Sách / Tài liệu', icon: 'book-open-page-variant' },
  { name: 'Vật dụng cá nhân', icon: 'tshirt-crew' },
  { name: 'Phí dịch vụ', icon: 'receipt' },
  { name: 'Gửi xe', icon: 'parking' },
  { name: 'Khác', icon: 'dots-horizontal' },
];

const categories = [...incomeCategories, ...expenseCategories];

const recurrenceOptions = [
  {label: 'Không lặp lại', value: 'none'},
  {label: 'Hàng ngày', value: 'daily'},
  {label: 'Hàng tuần', value: 'weekly'},
  {label: 'Hàng tháng', value: 'monthly'},
];

const AddScreen = () => {
  const { colors, theme } = useTheme();
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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.select({ios: 'padding', android: undefined})}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Thêm giao dịch</Text>

        {/* --- Chọn ví --- */}
        <TouchableOpacity
          style={[
            styles.input,
            styles.dropdown,
            { 
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
              borderColor: theme === 'dark' ? '#444' : '#ddd'
            }
          ]}
          onPress={() => setModalWalletVisible(true)}>
          <Text style={{ color: colors.text }}>
            {' '}
            {selectedWalletId
              ? wallets.find(w => w.id === selectedWalletId)?.name
              : 'Chọn ví'}
          </Text>
          <ArrowDown2 size={20} color={colors.text} />
        </TouchableOpacity>

        {/* --- Chọn danh mục --- */}
        <TouchableOpacity
          style={[
            styles.input,
            styles.dropdown,
            { 
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
              borderColor: theme === 'dark' ? '#444' : '#ddd'
            }
          ]}
          onPress={() => setModalVisible(true)}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {icon ? (
              <Icon
                name={icon}
                size={20}
                color={colors.text}
                style={{marginRight: 8}}
              />
            ) : null}
            <Text style={{ color: colors.text }}>{category || 'Chọn danh mục'}</Text>
          </View>
          <ArrowDown2 size={20} color={colors.text} />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
              color: colors.text,
              borderColor: theme === 'dark' ? '#444' : '#ddd'
            }
          ]}
          placeholder="Số tiền"
          placeholderTextColor={theme === 'dark' ? '#666' : '#999'}
          keyboardType="numeric"
          value={amount}
          onChangeText={text => {
            const raw = text.replace(/[^0-9]/g, '');
            const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            setAmount(formatted);
          }}
        />

        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
              color: colors.text,
              borderColor: theme === 'dark' ? '#444' : '#ddd'
            }
          ]}
          placeholder="Ghi chú (tùy chọn)"
          placeholderTextColor={theme === 'dark' ? '#666' : '#999'}
          value={note}
          onChangeText={setNote}
        />

        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
              color: colors.text,
              borderColor: theme === 'dark' ? '#444' : '#ddd'
            }
          ]}
          placeholder="Thêm thẻ (tags), cách nhau bằng dấu phẩy"
          placeholderTextColor={theme === 'dark' ? '#666' : '#999'}
          value={tags}
          onChangeText={setTags}
        />

        <TouchableOpacity
          style={[
            styles.input,
            styles.dropdown,
            { 
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
              borderColor: theme === 'dark' ? '#444' : '#ddd'
            }
          ]}
          onPress={() => setModalRecurrenceVisible(true)}>
          <Text style={{ color: colors.text }}>
            Tùy chọn lặp lại: {
              recurrenceOptions.find(o => o.value === recurrence)?.label || ''
            }
          </Text>
          <ArrowDown2 size={20} color={colors.text} />
        </TouchableOpacity>

        {recurrence === 'monthly' && (
          <TouchableOpacity
            style={[
              styles.input,
              styles.dropdown,
              { 
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
                borderColor: theme === 'dark' ? '#444' : '#ddd'
              }
            ]}
            onPress={() => setModalRecurrenceDayVisible(true)}>
            <Text style={{ color: colors.text }}>
              Ngày trong tháng: {recurrenceDay ? recurrenceDay : 'Chọn ngày'}
            </Text>
            <ArrowDown2 size={20} color={colors.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, { backgroundColor: '#2196F3' }]} onPress={onSave}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>Lưu</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal chọn ví */}
      <Modal
        visible={modalWalletVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalWalletVisible(false)}>
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => setModalWalletVisible(false)}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Chọn ví</Text>
            {wallets.length === 0 ? (
              <Text style={[styles.walletItemText, { color: colors.text }]}>
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
                      { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff' }
                    ]}
                    onPress={() => {
                      setSelectedWalletId(item.id);
                      setModalWalletVisible(false);
                    }}>
                    <Text style={[
                      styles.walletItemText,
                      { color: selectedWalletId === item.id ? '#fff' : colors.text }
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
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Chọn danh mục</Text>
            <ScrollView>
              <Text style={[styles.categorySectionTitle, { color: colors.text }]}>Thu nhập</Text>
              {incomeCategories.map(cat => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryItem,
                    category === cat.name && styles.categoryItemSelected,
                    { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff' }
                  ]}
                  onPress={() => {
                    setCategory(cat.name);
                    setIcon(cat.icon);
                    setType('income');
                    setModalVisible(false);
                  }}>
                  <Icon name={cat.icon} size={20} style={{marginRight: 10}} color={colors.text} />
                  <Text style={{ color: colors.text }}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
              <Text style={[styles.categorySectionTitle, { color: colors.text }]}>Chi tiêu</Text>
              {expenseCategories.map(cat => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryItem,
                    category === cat.name && styles.categoryItemSelected,
                    { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff' }
                  ]}
                  onPress={() => {
                    setCategory(cat.name);
                    setIcon(cat.icon);
                    setType('expense');
                    setModalVisible(false);
                  }}>
                  <Icon name={cat.icon} size={20} style={{marginRight: 10}} color={colors.text} />
                  <Text style={{ color: colors.text }}>{cat.name}</Text>
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
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => setModalRecurrenceVisible(false)}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            {recurrenceOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.recurrenceItem,
                  recurrence === opt.value && styles.recurrenceItemSelected,
                  { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff' }
                ]}
                onPress={() => {
                  setRecurrence(opt.value);
                  setRecurrenceDay(null);
                  setModalRecurrenceVisible(false);
                }}>
                <Text style={[
                  recurrence === opt.value && {color: '#fff', fontWeight: 'bold'},
                  { color: colors.text }
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
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => setModalRecurrenceDayVisible(false)}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <FlatList
              data={daysInMonth}
              keyExtractor={item => item.toString()}
              numColumns={7}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.dayItem,
                    recurrenceDay === item && styles.dayItemSelected,
                    { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff' }
                  ]}
                  onPress={() => {
                    setRecurrenceDay(item);
                    setModalRecurrenceDayVisible(false);
                  }}>
                  <Text style={[
                    recurrenceDay === item && {color: '#fff', fontWeight: 'bold'},
                    { color: colors.text }
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
  container: {flex: 1, padding: 20},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center'},
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
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
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
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
    backgroundColor: '#2196F3',
  },
  recurrenceItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recurrenceItemSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
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
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
});
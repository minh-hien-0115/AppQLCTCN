import React, {useState, useEffect} from 'react';
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
  // --- Thêm phần chọn ví ---
  const [wallets, setWallets] = useState<
    {id: string; name: string; icon?: string}[]
  >([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [modalWalletVisible, setModalWalletVisible] = useState(false);

  // Các state bạn đã có
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

  // Load danh sách ví của user từ firestore (ví dụ)
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) return;

        const walletsSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('wallets')
          .get();

        const walletsData = walletsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as {id: string; name: string; icon?: string}[];

        setWallets(walletsData);

        // Nếu có ví thì chọn mặc định ví đầu tiên
        if (walletsData.length > 0) setSelectedWalletId(walletsData[0].id);
      } catch (error) {
        console.error('Lỗi lấy ví:', error);
      }
    };

    fetchWallets();
  }, []);

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

      // userId
      const userId = currentUser.uid;
      const walletId = selectedWalletId;

      await firestore()
        .collection('users')
        .doc(userId)
        .collection('wallets')
        .doc(walletId)
        .collection('transactions')
        .add({
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

      Alert.alert('Thành công', 'Giao dịch đã được thêm.');

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
      console.error(error);
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
            Tần suất lặp lại:{' '}
            {recurrenceOptions.find(r => r.value === recurrence)?.label}
            {recurrence === 'monthly' && recurrenceDay
              ? ` (Ngày ${recurrenceDay})`
              : ''}
          </Text>
          <ArrowDown2 size={20} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Lưu giao dịch</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal chọn ví */}
      <Modal visible={modalWalletVisible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalWalletVisible(false)}>
              <CloseCircle size={28} color="red" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={wallets}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => {
                  setSelectedWalletId(item.id);
                  setModalWalletVisible(false);
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {item.icon ? (
                    <Icon
                      name={item.icon}
                      size={20}
                      color="#555"
                      style={{marginRight: 10}}
                    />
                  ) : null}
                  <Text style={styles.categoryItemText}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Modal chọn danh mục */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <CloseCircle size={28} color="red" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            keyExtractor={item => item.name}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => {
                  setCategory(item.name);
                  setIcon(item.icon);
                  setType(
                    incomeCategories.some(c => c.name === item.name)
                      ? 'income'
                      : 'expense',
                  );
                  setModalVisible(false);
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon
                    name={item.icon}
                    size={20}
                    color="#555"
                    style={{marginRight: 10}}
                  />
                  <Text style={styles.categoryItemText}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Modal chọn tần suất lặp lại */}
      <Modal visible={modalRecurrenceVisible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalRecurrenceVisible(false)}>
              <CloseCircle size={28} color="red" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={recurrenceOptions}
            keyExtractor={item => item.value}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => {
                  setRecurrence(item.value);
                  setRecurrenceDay(null);
                  setModalRecurrenceVisible(false);
                  if (item.value === 'monthly') {
                    setModalRecurrenceDayVisible(true);
                  }
                }}>
                <Text style={styles.categoryItemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Modal chọn ngày trong tháng nếu lặp lại hàng tháng */}
      <Modal visible={modalRecurrenceDayVisible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalRecurrenceDayVisible(false)}>
              <CloseCircle size={28} color="red" />
            </TouchableOpacity>
          </View>
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
                    styles.dayText,
                    recurrenceDay === item && styles.dayTextSelected,
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  categoryItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  categoryItemText: {
    fontSize: 16,
  },
  dayItem: {
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayItemSelected: {
    backgroundColor: '#1e90ff',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
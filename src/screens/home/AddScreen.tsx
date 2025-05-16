import React, {useState} from 'react';
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

  const onSave = async () => {
    if (!category.trim() || !amount.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập danh mục và số tiền.');
      return;
    }

    if (!type || !icon) {
      Alert.alert('Lỗi', 'Danh mục không hợp lệ.');
      return;
    }

    const amountNumber = Number(amount.replace(/,/g, ''));
    if (isNaN(amountNumber) || amountNumber <= 0) {
      Alert.alert('Lỗi', 'Số tiền không hợp lệ.');
      return;
    }

    const tagsArray = tags
      .split(', ')
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

      const userDoc = await firestore()
        .collection('users')
        .where('email', '==', currentUser.email)
        .limit(1)
        .get();

      if (userDoc.empty) {
        Alert.alert('Lỗi', 'Tài khoản của bạn không tồn tại trong hệ thống.');
        return;
      }

      const userId = currentUser.uid;

      await firestore()
      .collection('users')
      .doc(userId)
      .collection('transactions').add({
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
      <Modal visible={modalRecurrenceVisible} transparent animationType="fade">
        <View style={styles.modalRecurrenceContainer}>
          <View style={styles.modalRecurrenceContent}>
            <Text style={styles.modalTitle}>Chọn tần suất lặp lại</Text>
            {recurrenceOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.recurrenceOption,
                  recurrence === option.value &&
                    styles.recurrenceOptionSelected,
                ]}
                onPress={() => {
                  setRecurrence(option.value);
                  setModalRecurrenceVisible(false);
                  if (option.value === 'monthly')
                    setModalRecurrenceDayVisible(true);
                }}>
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalRecurrenceVisible(false)}>
              <Text style={{color: 'red'}}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal chọn ngày trong tháng */}
      <Modal
        visible={modalRecurrenceDayVisible}
        transparent
        animationType="fade">
        <View style={styles.modalRecurrenceContainer}>
          <View style={[styles.modalRecurrenceContent, {alignItems: 'center'}]}>
            <Text style={styles.modalTitle}>Chọn ngày trong tháng</Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
              {daysInMonth.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayItem,
                    recurrenceDay === day && {backgroundColor: '#007AFF'},
                  ]}
                  onPress={() => {
                    setRecurrenceDay(day);
                    setModalRecurrenceDayVisible(false);
                  }}>
                  <Text
                    style={{color: recurrenceDay === day ? '#fff' : '#000'}}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalRecurrenceDayVisible(false)}>
              <Text style={{color: 'red'}}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
    paddingHorizontal: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 12,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  categoryItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItemText: {fontSize: 16},
  modalRecurrenceContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalRecurrenceContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  recurrenceOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recurrenceOptionSelected: {
    backgroundColor: '#e6f0ff',
  },
  modalCloseButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  dayItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

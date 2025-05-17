import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import Icon from 'react-native-vector-icons/MaterialIcons'

type Wallet = {
  id: string
  name: string
  expenseThreshold: number
}

// Hàm format số tiền nhập có dấu phẩy
const formatNumberWithCommas = (value: string) => {
  const numericValue = value.replace(/[^0-9]/g, '')
  if (!numericValue) return ''
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const ExpenseSavingScreen = () => {
  const userId = auth().currentUser?.uid ?? ''
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [selectedWalletId, setSelectedWalletId] = useState<string>('')
  const [thresholdInput, setThresholdInput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    if (!userId) return

    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .collection('wallets')
      .onSnapshot(snapshot => {
        const list: Wallet[] = []
        snapshot.forEach(doc => {
          const data = doc.data()
          list.push({
            id: doc.id,
            name: data.name,
            expenseThreshold: data.expenseThreshold ?? 0,
          })
        })
        setWallets(list)
        if (list.length > 0 && !selectedWalletId) {
          setSelectedWalletId(list[0].id)
          setThresholdInput(formatNumberWithCommas(list[0].expenseThreshold.toString()))
        }
      })

    return () => unsubscribe()
  }, [userId])

  const updateThreshold = async () => {
    if (!selectedWalletId) {
      Alert.alert('Lỗi', 'Vui lòng chọn ví')
      return
    }
    const numThreshold = Number(thresholdInput.replace(/,/g, ''))
    if (isNaN(numThreshold) || numThreshold < 0) {
      Alert.alert('Lỗi', 'Ngưỡng phải là số lớn hơn hoặc bằng 0')
      return
    }
    setLoading(true)
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('wallets')
        .doc(selectedWalletId)
        .update({ expenseThreshold: numThreshold })

      Alert.alert('Thành công', 'Cập nhật ngưỡng chi tiêu thành công')
      setThresholdInput('')
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể cập nhật ngưỡng')
      console.log(e)
    }
    setLoading(false)
  }

  const selectedWallet = wallets.find(w => w.id === selectedWalletId)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn ví và đặt ngưỡng chi tiêu</Text>

      <TouchableOpacity
        style={[styles.walletItem, styles.walletItemSelected]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.walletName}>
          {selectedWallet ? selectedWallet.name : 'Chưa chọn ví'}
        </Text>
        <Text style={styles.walletInfo}>
          Ngưỡng chi tiêu:{' '}
          {selectedWallet
            ? selectedWallet.expenseThreshold.toLocaleString() + ' VND'
            : '-'}
        </Text>
      </TouchableOpacity>

      <Text>Ngưỡng chi tiêu (VND):</Text>
      <TextInput
        value={thresholdInput}
        placeholder='Ngưỡng chi tiêu cho phép'
        onChangeText={text => setThresholdInput(formatNumberWithCommas(text))}
        keyboardType="numeric"
        style={styles.input}
      />
      <TouchableOpacity style={styles.btn} onPress={updateThreshold} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Cập nhật ngưỡng</Text>
        )}
      </TouchableOpacity>

      {/* Modal chọn ví */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ví</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {wallets.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 10 }}>
                Không có ví nào.
              </Text>
            ) : (
              <ScrollView>
                {wallets.map(wallet => (
                  <Pressable
                    key={wallet.id}
                    style={[
                      styles.walletItem,
                      wallet.id === selectedWalletId && styles.walletItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedWalletId(wallet.id)
                      setThresholdInput(formatNumberWithCommas(wallet.expenseThreshold.toString()))
                      setModalVisible(false)
                    }}
                  >
                    <Text style={styles.walletName}>{wallet.name}</Text>
                    <Text style={styles.walletInfo}>
                      Ngưỡng chi tiêu: {wallet.expenseThreshold.toLocaleString()} VND
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ExpenseSavingScreen

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 10 },

  walletItem: {
    borderWidth: 1,
    borderColor: '#888',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  walletItemSelected: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  walletName: { fontSize: 16, fontWeight: '700' },
  walletInfo: { fontSize: 14, color: '#555' },

  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 15,
  },

  btn: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  btnText: { color: 'white', fontWeight: '600', textAlign: 'center' },

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
})
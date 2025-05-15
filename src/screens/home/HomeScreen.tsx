import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen = () => {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setDisplayName(user.displayName || '');
    }

    const unsubscribe = firestore()
      .collection('transactions')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data as any[]);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const totalIncome = transactions
    .filter(item => item.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(item => item.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ';
  };

  const renderTransaction = ({item}: {item: any}) => {
    const color = item.type === 'income' ? '#4caf50' : '#f44336';

    return (
      <View style={styles.transactionItem}>
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
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Xin chào, {displayName || 'Người dùng'}!
      </Text>

      <View style={styles.summaryBox}>
        <Text style={styles.label}>Số dư hiện tại</Text>
        <Text style={styles.balance}>{formatCurrency(balance)}</Text>

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
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={{paddingBottom: 20}}
        />
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
    elevation: 2,
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
});

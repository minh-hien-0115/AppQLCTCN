import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import auth from '@react-native-firebase/auth';
import { appColors } from '../../constants/appColors';

const screenWidth = Dimensions.get('window').width;

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const StatisticalScreen = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('both');
  const [chartType, setChartType] = useState<'pie' | 'line' | 'both'>('both');

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const unsubscribeWallets = firestore()
      .collection('users')
      .doc(userId)
      .collection('wallets')
      .onSnapshot(snapshot => {
        const walletData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWallets(walletData);
      });

    return () => unsubscribeWallets();
  }, []);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    setLoading(true);

    const unsubscribes: (() => void)[] = [];

    const listenWallets =
      selectedWallet === 'all' ? wallets : wallets.filter(w => w.id === selectedWallet);

    if (listenWallets.length === 0) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    let allTransactions: any[] = [];

    listenWallets.forEach(wallet => {
      const unsubscribe = firestore()
        .collection('users')
        .doc(userId)
        .collection('wallets')
        .doc(wallet.id)
        .collection('transactions')
        .onSnapshot(snapshot => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            walletId: wallet.id,
            ...doc.data(),
            date: doc.data().date?.toDate?.() || new Date(),
          }));

          allTransactions = [
            ...allTransactions.filter(t => t.walletId !== wallet.id),
            ...data,
          ];

          setTransactions([...allTransactions]);
          setLoading(false);
        });
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [wallets, selectedWallet]);

  useEffect(() => {
    const now = dayjs();
    let filtered = transactions;

    if (selectedWallet !== 'all') {
      filtered = filtered.filter(t => t.walletId === selectedWallet);
    }

    if (timeFilter !== 'all') {
      filtered = filtered.filter(t => {
        const tDate = dayjs(t.date);
        switch (timeFilter) {
          case 'day':
            return tDate.isSame(now, 'day');
          case 'week':
            return tDate.isSame(now, 'week');
          case 'month':
            return tDate.isSame(now, 'month');
          case 'year':
            return tDate.isSame(now, 'year');
          default:
            return true;
        }
      });
    }

    if (typeFilter !== 'both') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedWallet, timeFilter, typeFilter]);

  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome + totalExpense;

  const selectedWalletObj = wallets.find(w => w.id === selectedWallet);
  const walletBalance =
    selectedWallet === 'all'
      ? balance
      : typeof selectedWalletObj?.balance === 'number'
      ? selectedWalletObj.balance
      : 0;

  const amountByCategory = filteredTransactions.reduce(
    (acc: Record<string, number>, t) => {
      if (!t.category) return acc;
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    },
    {},
  );

  const categoryList = Object.entries(amountByCategory).map(([category, amount]) => ({
    category,
    amount,
  }));

  const formatCurrency = (num: number) => num.toLocaleString('vi-VN') + ' đ';

  const formatShortCurrency = (label: string): string => {
    const num = parseFloat(label);
    if (num >= 1e7) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'tr';
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'tr';
    if (num >= 1e5) return (num / 1e3).toFixed(0) + 'k';
    if (num >= 1e4) return (num / 1e3).toFixed(1) + 'k';
    return num.toLocaleString('vi-VN');
  };


  const totalAmount = categoryList.reduce((sum, item) => sum + item.amount, 0);

  const pieChartData = categoryList.map(item => {
    const percent = totalAmount ? ((item.amount / totalAmount) * 100).toFixed(1) : '0.0';
    return {
      name: `${item.category} (${percent}%)`,
      amount: item.amount,
      color: getRandomColor(),
      legendFontColor: '#333',
      legendFontSize: 14,
    };
  });

  const categoryColorsMap = pieChartData.reduce<Record<string, string>>((acc, item) => {
    const category = item.name.split(' (')[0];
    acc[category] = item.color;
    return acc;
  }, {});

  const Legend = ({
    items,
    colors,
    amounts,
  }: {
    items: string[];
    colors: string[];
    amounts: number[];
  }) => (
    <View style={styles.legendContainerColumn}>
      {items.map((item, idx) => (
        <View key={idx} style={styles.legendItemColumn}>
          <View style={[styles.legendColor, { backgroundColor: colors[idx] }]} />
          <Text style={styles.legendLabel}>{item}</Text>
          <Text style={styles.legendAmount}>{formatCurrency(amounts[idx])}</Text>
          <View style={styles.legendDivider} />
        </View>
      ))}
    </View>
  );

  const last7Days = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(3 - i, 'day').format('DD/MM'),
  );

  const incomeData = last7Days.map(day =>
    filteredTransactions
      .filter(t => dayjs(t.date).format('DD/MM') === day && t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0),
  );

  const expenseData = last7Days.map(day =>
    filteredTransactions
      .filter(t => dayjs(t.date).format('DD/MM') === day && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0),
  );

  const totalData = incomeData.map((income, idx) => income + expenseData[idx]);

  const lineChartData = {
    labels: last7Days,
    datasets: [
      {
        data: incomeData,
        color: () => '#4CAF50',
        strokeWidth: 2,
      },
      {
        data: expenseData,
        color: () => '#F44336',
        strokeWidth: 2,
      },
      {
        data: totalData,
        color: () => '#2196F3',
        strokeWidth: 2,
      },
    ],
    legend: ['Thu nhập', 'Chi tiêu', 'Tổng'],
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thống kê tài chính</Text>

      <View style={styles.summaryBox}>
        <Text style={[styles.label, { fontWeight: 'bold' }]}>
          Số dư: {wallets.length === 0 ? 'Đang tải...' : formatCurrency(walletBalance)}
        </Text>
        <Text style={styles.label}>Tổng thu nhập: {formatCurrency(totalIncome)}</Text>
        <Text style={styles.label}>Tổng chi tiêu: {formatCurrency(totalExpense)}</Text>
      </View>

      <View style={{ marginBottom: 15 }}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Chọn ví:</Text>
          <Picker
            selectedValue={selectedWallet}
            style={styles.picker}
            onValueChange={value => setSelectedWallet(value)}
          >
            <Picker.Item label="Tất cả ví" value="all" />
            {wallets.map(wallet => (
              <Picker.Item key={wallet.id} label={wallet.name} value={wallet.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.pickerRow}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Thời gian:</Text>
          <Picker
            selectedValue={timeFilter}
            style={styles.picker}
            onValueChange={value => setTimeFilter(value)}
          >
            <Picker.Item label="Tất cả" value="all" />
            <Picker.Item label="Hôm nay" value="day" />
            <Picker.Item label="Tuần này" value="week" />
            <Picker.Item label="Tháng này" value="month" />
            <Picker.Item label="Năm nay" value="year" />
          </Picker>
        </View>

        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Loại giao dịch:</Text>
          <Picker
            selectedValue={typeFilter}
            style={styles.picker}
            onValueChange={value => setTypeFilter(value)}
          >
            <Picker.Item label="Thu nhập và chi tiêu" value="both" />
            <Picker.Item label="Thu nhập" value="income" />
            <Picker.Item label="Chi tiêu" value="expense" />
          </Picker>
        </View>
      </View>

      <View style={styles.pickerColumn}>
        <Text style={styles.pickerLabel}>Loại biểu đồ:</Text>
        <Picker
          selectedValue={chartType}
          style={styles.picker}
          onValueChange={(value: 'pie' | 'line' | 'both') => setChartType(value)}
        >
          <Picker.Item label="Biểu đồ tròn" value="pie" />
          <Picker.Item label="Biểu đồ đường" value="line" />
          <Picker.Item label="Cả hai" value="both" />
        </Picker>
      </View>

      {(chartType === 'pie' || chartType === 'both') &&
        (categoryList.length > 0 ? (
          <>
            <PieChart
              data={pieChartData}
              width={screenWidth - 20}
              height={220}
              hasLegend={false}
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <Legend
              items={categoryList.map(c => c.category)}
              colors={categoryList.map(c => categoryColorsMap[c.category])}
              amounts={categoryList.map(c => c.amount)}
            />
          </>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
            Không có dữ liệu để hiển thị biểu đồ
          </Text>
        ))}

      {(chartType === 'line' || chartType === 'both') && (
        <>
          {/* <Text style={[styles.title, { fontSize: 20, marginTop: 30 }]}>
            Biểu đồ thu chi 7 ngày qua
          </Text> */}
        <ScrollView horizontal style={{marginTop: 15}} showsHorizontalScrollIndicator={false} >
          <LineChart
            data={lineChartData}
            width={Math.max(last7Days.length * 60, screenWidth - 20)}
            height={256}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 8,
            }}
            formatYLabel={formatShortCurrency}
          />
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
};

export default StatisticalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#222',
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: appColors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: appColors.text,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  pickerColumn: {
    flex: 1,
    marginRight: 10,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  legendContainerColumn: {
    marginTop: 10,
    flexDirection: 'column',
  },
  legendItemColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: appColors.border,
    paddingBottom: 3,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  legendAmount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  legendDivider: {
    marginTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
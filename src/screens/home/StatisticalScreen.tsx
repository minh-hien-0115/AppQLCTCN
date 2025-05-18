import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {PieChart, LineChart} from 'react-native-chart-kit';
import {Picker} from '@react-native-picker/picker';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import auth from '@react-native-firebase/auth';
import {appColors} from '../../constants/appColors';
import DateTimePicker from '@react-native-community/datetimepicker';

dayjs.extend(weekOfYear);
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
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month' | 'year'>('all');
  const [typeFilter, setTypeFilter] = useState('both');
  const [chartType, setChartType] = useState<'pie' | 'line' | 'both'>('both');
  const [selectedDate, setSelectedDate] = useState(new Date()); // cho ngày
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1); // 1->12

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null); // tuần trong năm

  // Tạo ds năm dùng picker
  const currentYear = dayjs().year();
  const years = Array.from({length: 10}, (_, i) => currentYear - 5 + i);

  // Ds tháng 1->12
  const months = Array.from({length: 12}, (_, i) => i + 1);

  // Ds tuần trong năm
  const weeksInYear = 53;
  const weeks = Array.from({length: weeksInYear}, (_, i) => i + 1);

  // === Load wallets ===
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

  // === Load transactions ===
  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    setLoading(true);

    const unsubscribes: (() => void)[] = [];

    const listenWallets =
      selectedWallet === 'all'
        ? wallets
        : wallets.filter(w => w.id === selectedWallet);

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

  // === Lọc transactions dựa trên filter + chọn thời gian chi tiết ===
  useEffect(() => {
    let filtered = transactions;

    // Lọc ví
    if (selectedWallet !== 'all') {
      filtered = filtered.filter(t => t.walletId === selectedWallet);
    }

    // Lọc loại giao dịch
    if (typeFilter !== 'both') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Lọc theo thời gian chung
    if (timeFilter !== 'all') {
      filtered = filtered.filter(t => {
        const tDate = dayjs(t.date);

        switch (timeFilter) {
          case 'day':
            // So sánh với selectedDate (ngày cụ thể)
            return tDate.isSame(dayjs(selectedDate), 'day');

          case 'week':
            if (selectedWeek === null) return true; // chưa chọn tuần => show hết
            // So sánh tuần và năm
            const weekNum = tDate.week();
            const yearNum = tDate.year();
            return yearNum === selectedYear && weekNum === selectedWeek;

          case 'month':
            // So sánh tháng + năm
            return (
              tDate.month() + 1 === selectedMonth &&
              tDate.year() === selectedYear
            );

          case 'year':
            // So sánh năm
            return tDate.year() === selectedYear;

          default:
            return true;
        }
      });
    }

    setFilteredTransactions(filtered);
  }, [
    transactions,
    selectedWallet,
    timeFilter,
    typeFilter,
    selectedDate,
    selectedYear,
    selectedMonth,
    selectedWeek,
  ]);

  const incomeTransactions = filteredTransactions.filter(
    t => t.type === 'income',
  );
  const expenseTransactions = filteredTransactions.filter(
    t => t.type === 'expense',
  );
  const totalIncome = incomeTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );
  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );
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

  const categoryList = Object.entries(amountByCategory).map(
    ([category, amount]) => ({
      category,
      amount,
    }),
  );

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
    const percent = totalAmount
      ? ((item.amount / totalAmount) * 100).toFixed(1)
      : '0.0';
    return {
      name: `${item.category} (${percent}%)`,
      amount: item.amount,
      color: getRandomColor(),
      legendFontColor: '#333',
      legendFontSize: 14,
    };
  });

  const categoryColorsMap = pieChartData.reduce<Record<string, string>>(
    (acc, item) => {
      const category = item.name.split(' (')[0];
      acc[category] = item.color;
      return acc;
    },
    {},
  );

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
          <View style={[styles.legendColor, {backgroundColor: colors[idx]}]} />
          <Text style={styles.legendLabel}>{item}</Text>
          <Text style={styles.legendAmount}>{formatCurrency(amounts[idx])}</Text>
          <View style={styles.legendDivider} />
        </View>
      ))}
    </View>
  );

  const last7Days = Array.from({length: 7}, (_, i) =>
    dayjs()
      .subtract(3 - i, 'day')
      .format('DD/MM'),
  );

  const incomeData = last7Days.map(day =>
    filteredTransactions
      .filter(t => dayjs(t.date).format('DD/MM') === day && t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0),
  );

  const expenseData = last7Days.map(day =>
    filteredTransactions
      .filter(
        t => dayjs(t.date).format('DD/MM') === day && t.type === 'expense',
      )
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

  const renderTimeDetailPicker = () => {
    switch (timeFilter) {
      case 'day':
        return (
          <>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.datePickerButtonText}>
                Chọn ngày: {dayjs(selectedDate).format('DD/MM/YYYY')}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setSelectedDate(date);
                }}
              />
            )}
          </>
        );

      case 'week':
        return (
          <>
            <View style={{marginBottom: 8}}>
              <Text style={styles.pickerLabel}>Chọn năm:</Text>
              <Picker
                selectedValue={selectedYear}
                style={styles.picker}
                onValueChange={value => {
                  setSelectedYear(value);
                  setSelectedWeek(null); // reset tuần khi đổi năm
                }}>
                {years.map(y => (
                  <Picker.Item key={y} label={y.toString()} value={y} />
                ))}
              </Picker>
            </View>
            <View style={{marginBottom: 15}}>
              <Text style={styles.pickerLabel}>Chọn tuần:</Text>
              <Picker
                selectedValue={selectedWeek}
                style={styles.picker}
                onValueChange={value => setSelectedWeek(value)}>
                <Picker.Item label="Chọn tuần" value={null} />
                {weeks.map(w => (
                  <Picker.Item key={w} label={`Tuần ${w}`} value={w} />
                ))}
              </Picker>
            </View>
          </>
        );

      case 'month':
        return (
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 15,
              alignItems: 'center',
            }}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.pickerLabel}>Chọn tháng:</Text>
              <Picker
                selectedValue={selectedMonth}
                style={styles.picker}
                onValueChange={value => setSelectedMonth(value)}>
                {months.map(m => (
                  <Picker.Item key={m} label={`${m}`} value={m} />
                ))}
              </Picker>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.pickerLabel}>Chọn năm:</Text>
              <Picker
                selectedValue={selectedYear}
                style={styles.picker}
                onValueChange={value => setSelectedYear(value)}>
                {years.map(y => (
                  <Picker.Item key={y} label={y.toString()} value={y} />
                ))}
              </Picker>
            </View>
          </View>
        );

      case 'year':
        return (
          <View style={{marginBottom: 15}}>
            <Text style={styles.pickerLabel}>Chọn năm:</Text>
            <Picker
              selectedValue={selectedYear}
              style={styles.picker}
              onValueChange={value => setSelectedYear(value)}>
              {years.map(y => (
                <Picker.Item key={y} label={y.toString()} value={y} />
              ))}
            </Picker>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Thống kê chi tiêu</Text>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>
          Số dư: {formatCurrency(walletBalance)}
        </Text>
        <Text style={styles.balanceDetailText}>
          Thu nhập: {formatCurrency(totalIncome)}
        </Text>
        <Text style={styles.balanceDetailText}>
          Chi tiêu: {formatCurrency(totalExpense)}
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.label}>Ví:</Text>
        <Picker
          selectedValue={selectedWallet}
          onValueChange={value => setSelectedWallet(value)}
          style={styles.picker}>
          <Picker.Item label="Tất cả" value="all" />
          {wallets.map(wallet => (
            <Picker.Item
              key={wallet.id}
              label={wallet.name}
              value={wallet.id}
            />
          ))}
        </Picker>

        <Text style={styles.label}>Thời gian:</Text>
        <Picker
          selectedValue={timeFilter}
          onValueChange={value => setTimeFilter(value)}
          style={styles.picker}>
          <Picker.Item label="Tất cả" value="all" />
          <Picker.Item label="Ngày" value="day" />
          <Picker.Item label="Tuần" value="week" />
          <Picker.Item label="Tháng" value="month" />
          <Picker.Item label="Năm" value="year" />
        </Picker>

        {renderTimeDetailPicker()}

        <Text style={styles.label}>Loại giao dịch:</Text>
        <Picker
          selectedValue={typeFilter}
          onValueChange={value => setTypeFilter(value)}
          style={styles.picker}>
          <Picker.Item label="Cả hai (Thu nhập và Chi tiêu)" value="both" />
          <Picker.Item label="Thu nhập" value="income" />
          <Picker.Item label="Chi tiêu" value="expense" />
        </Picker>

        <Text style={styles.label}>Loại biểu đồ:</Text>
        <Picker
          selectedValue={chartType}
          onValueChange={value => setChartType(value)}
          style={styles.picker}>
          <Picker.Item label="Cả hai" value="both" />
          <Picker.Item label="Biểu đồ tròn" value="pie" />
          <Picker.Item label="Biểu đồ đường" value="line" />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={appColors.primary} />
      ) : (
        <>
          {(chartType === 'pie' || chartType === 'both') &&
            pieChartData.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>
                  Phân bổ chi tiêu theo danh mục
                </Text>
                <PieChart
                  data={pieChartData}
                  width={screenWidth}
                  hasLegend={false}
                  height={220}
                  chartConfig={{
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                <Legend
                  items={categoryList.map(i => i.category)}
                  colors={pieChartData.map(i => i.color)}
                  amounts={categoryList.map(i => i.amount)}
                />
              </View>
            )}

          {(chartType === 'line' || chartType === 'both') && (
            <>
              <ScrollView
                horizontal
                style={{marginTop: 15}}
                showsHorizontalScrollIndicator={false}>
                <View style={styles.chartContainer}>
                  {/* <Text style={styles.chartTitle}>
                    Biểu đồ thu nhập - chi tiêu 7 ngày gần nhất
                  </Text> */}
                  <LineChart
                    data={lineChartData}
                    width={Math.max(last7Days.length * 60, screenWidth - 20)}
                    height={256}
                    chartConfig={{
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      propsForDots: {
                        r: '4',
                        strokeWidth: '1',
                        stroke: '#fff',
                      },
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                    formatYLabel={formatShortCurrency}
                  />
                </View>
              </ScrollView>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default StatisticalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  header: {
    padding: 16,
    // backgroundColor: appColors.primary,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    // color: 'white',
  },
  filterContainer: {
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    color: appColors.textPrimary,
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 4,
    ...Platform.select({
      android: {
        color: 'black',
      },
    }),
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: appColors.primary,
    borderRadius: 6,
    marginVertical: 8,
  },
  datePickerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  balanceContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    elevation: 4,
  },
  balanceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.textPrimary,
  },
  balanceDetailText: {
    fontSize: 15,
    marginTop: 6,
    color: appColors.textSecondary,
  },
  chartContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    elevation: 4,
  },
  chartTitle: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 12,
    color: appColors.textPrimary,
  },
  legendContainerColumn: {
    marginTop: 10,
    paddingHorizontal: 20,
    flexDirection: 'column',
  },
  legendItemColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: appColors.border,
    paddingBottom: 3,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: appColors.textPrimary,
  },
  legendAmount: {
    fontSize: 14,
    color: appColors.textSecondary,
    fontWeight: '600',
  },
  legendDivider: {
    // height: 1,
    // backgroundColor: '#eee',
    // flex: 1,
    // marginLeft: 8,
    marginTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerLabel: {
    fontSize: 14,
    color: appColors.textPrimary,
    marginBottom: 4,
  },
});
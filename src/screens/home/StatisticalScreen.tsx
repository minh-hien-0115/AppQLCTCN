import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {BarChart, PieChart, LineChart} from 'react-native-chart-kit';
import {Picker} from '@react-native-picker/picker';
import dayjs from 'dayjs';
import auth from '@react-native-firebase/auth';
import {appColors} from '../../constants/appColors';

const screenWidth = Dimensions.get('window').width;

const StatisticalScreen = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [typeFilter, setTypeFilter] = useState('both');

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate?.() || new Date(),
        }));
        setTransactions(data);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const now = dayjs();
    let filtered = transactions;

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
  }, [transactions, timeFilter, typeFilter]);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const filteredByCategory = filteredTransactions.filter(t =>
    typeFilter === 'both' ? true : t.type === typeFilter,
  );

  const amountByCategory = filteredByCategory.reduce(
    (acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
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

  const barChartData = {
    labels: categoryList.map(item => item.category),
    datasets: [
      {
        data: categoryList.map(item => item.amount),
      },
    ],
  };

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const totalAmount = categoryList.reduce((sum, item) => sum + item.amount, 0);

  const pieChartData = categoryList.map(item => {
    const percent = ((item.amount / totalAmount) * 100).toFixed(1);
    return {
      name: `${item.category} (${percent}%)`,
      amount: item.amount,
      color: getRandomColor(),
      legendFontColor: '#333',
      legendFontSize: 14,
    };
  });

  const colorsForLegend = pieChartData.map(item => item.color);

  const categoryColorsMap = categoryList.reduce<Record<string, string>>(
    (acc, item, idx) => {
      acc[item.category] = colorsForLegend[idx];
      return acc;
    },
    {},
  );

  // --- Tạo dữ liệu ngày trong 7 ngày gần nhất ---
  const last7Days = Array.from({length: 7}).map((_, i) =>
    dayjs()
      .subtract(2 - i, 'day')
      .format('DD/MM'),
  );

  const dailyData: Record<string, {income: number; expense: number}> = {};
  last7Days.forEach(date => {
    dailyData[date] = {income: 0, expense: 0};
  });

  filteredTransactions.forEach(t => {
    const date = dayjs(t.date).format('DD/MM');
    if (dailyData[date]) {
      if (t.type === 'income') dailyData[date].income += t.amount;
      if (t.type === 'expense') dailyData[date].expense += t.amount;
    }
  });

  const lineChartData = {
    labels: last7Days,
    datasets: [
      {
        data: last7Days.map(date => dailyData[date].income),
        color: () => '#4caf50',
        strokeWidth: 2,
      },
      {
        data: last7Days.map(date => dailyData[date].expense),
        color: () => '#f44336',
        strokeWidth: 2,
      },
    ],
    legend: ['Thu nhập', 'Chi tiêu'],
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  const Legend = ({items, colors}: {items: string[]; colors: string[]}) => (
    <View style={styles.legendContainer}>
      {items.map((item, idx) => (
        <View key={idx} style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: colors[idx]}]} />
          <Text style={styles.legendLabel}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thống kê tài chính</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.label}>
          Tổng thu nhập: {formatCurrency(totalIncome)}
        </Text>
        <Text style={styles.label}>
          Tổng chi tiêu: {formatCurrency(totalExpense)}
        </Text>
        <Text style={[styles.label, {fontWeight: 'bold'}]}>
          Số dư: {formatCurrency(balance)}
        </Text>
      </View>

      <View style={styles.pickerRow}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Thời gian:</Text>
          <Picker
            selectedValue={timeFilter}
            style={styles.picker}
            onValueChange={value => setTimeFilter(value)}>
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
            onValueChange={value => setTypeFilter(value)}>
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
          onValueChange={value => setChartType(value)}>
          <Picker.Item label="Biểu đồ cột" value="bar" />
          <Picker.Item label="Biểu đồ tròn" value="pie" />
          <Picker.Item label="Biểu đồ đường" value="line" />
        </Picker>
      </View>

      {chartType === 'bar' && (
        <>
          <ScrollView horizontal style={{marginTop: 15}}>
            <BarChart
              data={barChartData}
              width={Math.max(last7Days.length * 60, screenWidth - 20)}
              height={220}
              yAxisLabel=""
              yAxisSuffix=" đ"
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                
                color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
                labelColor: () => '#333',
                formatYLabel: formatShortCurrency,
                style: {borderRadius: 16},
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#4caf50',
                },
                propsForBackgroundLines: {strokeWidth: 0.5, stroke: '#ccc'},
              }}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={true}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              flatColor={true}
              
            />
          </ScrollView>

          <Legend
            items={['Thu nhập', 'Chi tiêu']}
            colors={['#4caf50', '#f44336']}
          />

          {/* --- Hiển thị chú thích chi tiết thu chi từng ngày --- */}
          <View style={styles.dailyDetailContainer}>
            {last7Days.map(date => (
              <View key={date} style={styles.dailyDetailItem}>
                <Text style={styles.dailyDate}>{date}</Text>
                <Text style={[styles.dailyIncome, {color: '#4caf50'}]}>
                  Thu: {formatCurrency(dailyData[date].income)}
                </Text>
                <Text style={[styles.dailyExpense, {color: '#f44336'}]}>
                  Chi: {formatCurrency(dailyData[date].expense)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {chartType === 'pie' && (
        <>
          <PieChart
            data={pieChartData}
            width={screenWidth - 20}
            height={220}
            hasLegend={false}
            chartConfig={{
              color: () => `rgba(0,0,0,0.7)`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />

          <Legend
            items={categoryList.map(c => c.category)}
            colors={categoryList.map(c => categoryColorsMap[c.category])}
          />
        </>
      )}

      {chartType === 'line' && (
        <>
          <ScrollView horizontal style={{marginTop: 15}}>
            <LineChart
              data={lineChartData}
              width={Math.max(last7Days.length * 60, screenWidth - 20)}
              height={220}
              yAxisLabel=""
              yAxisSuffix=" đ"
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 150, 136, ${opacity})`,
                labelColor: () => '#333',
                style: {borderRadius: 16},
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#4caf50',
                },
                propsForBackgroundLines: {strokeWidth: 0.5, stroke: '#ccc'},
              }}
              bezier
              fromZero
              segments={6}
              formatYLabel={formatShortCurrency}
            />
          </ScrollView>

          <Legend
            items={lineChartData.legend}
            colors={['#4caf50', '#f44336']}
          />

          {/* --- Hiển thị chú thích chi tiết thu chi từng ngày --- */}
          <View style={styles.dailyDetailContainer}>
            {last7Days.map(date => (
              <View key={date} style={styles.dailyDetailItem}>
                <Text style={styles.dailyDate}>{date}</Text>
                <Text style={[styles.dailyIncome, {color: '#4caf50'}]}>
                  Thu: {formatCurrency(dailyData[date].income)}
                </Text>
                <Text style={[styles.dailyExpense, {color: '#f44336'}]}>
                  Chi: {formatCurrency(dailyData[date].expense)}
                </Text>
              </View>
            ))}
          </View>
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
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
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
    color: appColors.text
  },
  pickerRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  pickerColumn: {
    flex: 1, 
    marginRight: 10
  },
  pickerLabel: {
    fontSize: 16, 
    marginBottom: 5, 
    color: '#555'
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
  },
  dailyDetailContainer: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  dailyDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dailyDate: {
    fontWeight: 'bold',
    color: '#222',
  },
  dailyIncome: {
    flex: 1, 
    textAlign: 'left', 
    marginLeft: 20
  },
  dailyExpense: {
    flex: 1, 
    textAlign: 'left', 
    marginLeft: 20
  },
});
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

const screenWidth = Dimensions.get('window').width;

const StatisticalScreen = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [typeFilter, setTypeFilter] = useState('both');

  useEffect(() => {
    const unsubscribe = firestore()
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

  const formatCurrency = (num: number) =>
    num.toLocaleString('vi-VN') + ' đ';

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

  // ➕ Group transactions for last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) =>
  dayjs().subtract(2 - i, 'day').format('DD/MM'),
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

  const barChart7DayData = {
    labels: last7Days,
    datasets: [
      {
        data: last7Days.map(date => {
          if (typeFilter === 'income') return dailyData[date].income;
          if (typeFilter === 'expense') return dailyData[date].expense;
          return dailyData[date].income - dailyData[date].expense;
        }),
      },
    ],
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  const Legend = ({
    items,
    colors,
  }: {
    items: string[];
    colors: string[];
  }) => (
    <View style={styles.legendContainer}>
      {items.map((item, idx) => (
        <View key={idx} style={styles.legendItem}>
          <View
            style={[styles.legendColor, {backgroundColor: colors[idx]}]}
          />
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

        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Biểu đồ:</Text>
          <Picker
            selectedValue={chartType}
            style={styles.picker}
            onValueChange={value => setChartType(value)}>
            <Picker.Item label="Biểu đồ cột" value="bar" />
            <Picker.Item label="Biểu đồ tròn" value="pie" />
            <Picker.Item label="Biểu đồ đường" value="line" />
          </Picker>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        {typeFilter === 'income'
          ? 'Thu nhập '
          : typeFilter === 'expense'
          ? 'Chi tiêu '
          : 'Thu nhập và chi tiêu '}
        {chartType === 'bar'
          ? '7 ngày gần nhất (Biểu đồ cột)'
          : chartType === 'pie'
          ? 'theo danh mục (Biểu đồ tròn)'
          : '7 ngày gần nhất (Biểu đồ đường)'}
      </Text>

      {chartType === 'bar' && (
        <>
          <BarChart
            data={barChart7DayData}
            width={screenWidth - 40}
            height={350}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              formatYLabel: formatShortCurrency,
            }}
            verticalLabelRotation={30}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              marginHorizontal: 16,
            }}
          />
        </>
      )}

      {chartType === 'pie' && categoryList.length > 0 && (
        <>
          <PieChart
            hasLegend={false}
            data={pieChartData}
            width={screenWidth - 16}
            height={220}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
            chartConfig={{
              color: () => `#000`,
              labelColor: () => '#000',
            }}
            style={{marginVertical: 8}}
          />
          <Legend
            items={categoryList.map(
              item => `${item.category} - ${formatCurrency(item.amount)}`,
            )}
            colors={pieChartData.map(item => item.color)}
          />
        </>
      )}

      {chartType === 'line' && (
        <>
          <LineChart
            data={lineChartData}
            width={screenWidth - 32}
            height={260}
            yAxisLabel=""
            yAxisSuffix=""
            yLabelsOffset={10}
            formatYLabel={formatShortCurrency}
            chartConfig={{
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '3',
                strokeWidth: '1',
                stroke: '#000',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
              marginHorizontal: 16,
            }}
          />
          <Legend items={lineChartData.legend} colors={['#4caf50', '#f44336']} />
        </>
      )}
    </ScrollView>
  );
};

export default StatisticalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    marginVertical: 4,
  },
  pickerRow: {
    flexDirection: 'column',
    paddingHorizontal: 16,
  },
  pickerColumn: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
  },
});
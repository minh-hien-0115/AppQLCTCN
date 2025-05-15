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
  const [typeFilter, setTypeFilter] = useState('both'); // 'income', 'expense', 'both'

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

  const formatCurrency = (num: number) => num.toLocaleString('vi-VN') + ' đ';

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

  const pieChartData = categoryList.map(item => ({
    name: item.category,
    amount: item.amount,
    color: getRandomColor(),
    legendFontColor: '#333',
    legendFontSize: 14,
  }));

  // For bar and pie chart, we use categoryList + colors, for line chart we show date and values
  // Prepare colors for bar/line chart legend
  // Generate colors for categories in bar chart legend
  const colorsForLegend = categoryList.map(() => getRandomColor());

  // Map categories to colors (reuse colorsForLegend)
  const categoryColorsMap = categoryList.reduce<Record<string, string>>(
    (acc, item, idx) => {
      acc[item.category] = colorsForLegend[idx];
      return acc;
    },
    {},
  );

  // Line chart data grouped by date
  const dailyAmountMap = filteredTransactions
    .filter(t => (typeFilter === 'both' ? true : t.type === typeFilter))
    .reduce((acc: Record<string, number>, t) => {
      const date = dayjs(t.date).format('DD/MM');
      acc[date] = (acc[date] || 0) + t.amount;
      return acc;
    }, {});

  const sortedDates = Object.keys(dailyAmountMap).sort((a, b) => {
    const da = dayjs(a, 'DD/MM');
    const db = dayjs(b, 'DD/MM');
    return da.isBefore(db) ? -1 : 1;
  });

  const lineChartData = {
    labels: sortedDates,
    datasets: [
      {
        data: sortedDates.map(date => dailyAmountMap[date]),
        strokeWidth: 2,
        color: () => '#1e90ff',
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

  // Legend component reusable for bar and line chart
  const Legend = ({
    items,
    colors,
  }: {
    items: string[];
    colors: string[];
  }) => {
    return (
      <View style={styles.legendContainer}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View
              style={[styles.legendColor, {backgroundColor: colors[idx]}]}
            />
            <Text style={styles.legendLabel}>
              {item}{' '}
              {chartType === 'bar'
                ? `(${formatCurrency(amountByCategory[item])})`
                : chartType === 'line'
                ? `(${formatCurrency(dailyAmountMap[item] || 0)})`
                : ''}
            </Text>
          </View>
        ))}
      </View>
    );
  };

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
          ? 'theo danh mục (Biểu đồ cột)'
          : chartType === 'pie'
          ? 'theo danh mục (Biểu đồ tròn)'
          : 'theo ngày (Biểu đồ đường)'}
      </Text>

      {chartType === 'bar' && categoryList.length > 0 && (
        <>
          <BarChart
            data={barChartData}
            width={screenWidth - 32}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" đ"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#1e90ff',
              },
            }}
            verticalLabelRotation={30}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            fromZero
          />
          {/* Legend for bar chart */}
          <Legend
            items={categoryList.map(item => item.category)}
            colors={colorsForLegend}
          />
        </>
      )}

      {chartType === 'pie' && pieChartData.length > 0 && (
        <>
          <PieChart
            data={pieChartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
          {/* Legend for pie chart is built-in, no need extra */}
        </>
      )}

      {chartType === 'line' && sortedDates.length > 0 && (
        <>
          <LineChart
            data={lineChartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#1e90ff',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            fromZero
          />
          {/* Legend for line chart (dates + values) */}
          <Legend items={sortedDates} colors={sortedDates.map(() => '#1e90ff')} />
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  picker: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    marginRight: 6,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
  },
});
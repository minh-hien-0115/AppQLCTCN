import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { appColors } from '../../constants/appColors';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const banks = [
  { name: 'Vietcombank', icon: 'university' },      // đại diện ngân hàng
  { name: 'Techcombank', icon: 'credit-card' },
  { name: 'VietinBank', icon: 'university' },
  { name: 'BIDV', icon: 'landmark' },               // toà nhà
  { name: 'ACB', icon: 'money-check-alt' },
];

const eWallets = [
  { name: 'MoMo', icon: 'mobile-alt' },
  { name: 'ZaloPay', icon: 'bolt' },
  { name: 'ShopeePay', icon: 'shopping-bag' },
  { name: 'VNPay', icon: 'server' },
  { name: 'Viettel Money', icon: 'money-bill-wave' },
];

const BanksAndEwallets = () => {
  const renderItem = (item: { name: string; icon: string }) => (
    <TouchableOpacity key={item.name} style={styles.item}>
      <FontAwesome5 name={item.icon} size={22} color={appColors.primary} solid />
      <Text style={[styles.itemText, { color: appColors.text }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: appColors.background }]}>
      <Text style={[styles.title, { color: appColors.text }]}>Ngân hàng</Text>
      <View>{banks.map(renderItem)}</View>

      <Text style={[styles.title, { color: appColors.text, marginTop: 30 }]}>
        Ví điện tử
      </Text>
      <View>{eWallets.map(renderItem)}</View>
    </ScrollView>
  );
};

export default BanksAndEwallets;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    gap: 12,
  },
  itemText: {
    fontSize: 16,
  },
});
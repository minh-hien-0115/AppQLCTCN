import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';

const InstructionsForUseScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hướng dẫn sử dụng</Text>
      <Text style={styles.text}>
        - Bước 1: Đăng ký tài khoản bằng email/số điện thoại{'\n'}
        - Bước 2: Thêm thu nhập và chi tiêu hàng ngày{'\n'}
        - Bước 3: Xem báo cáo thống kê theo tuần/tháng/năm{'\n'}
        - Bước 4: Quản lý ví, danh mục và mục tiêu tài chính{'\n'}
      </Text>
    </ScrollView>
  );
};

export default InstructionsForUseScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
});
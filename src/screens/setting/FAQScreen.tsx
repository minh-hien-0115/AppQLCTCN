import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';

const FAQScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Câu hỏi thường gặp</Text>

      <View style={styles.item}>
        <Text style={styles.question}>1. Làm thế nào để tạo tài khoản?</Text>
        <Text style={styles.answer}>Bạn có thể tạo tài khoản bằng cách đăng ký với email hoặc số điện thoại.</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.question}>2. Tôi quên mật khẩu thì làm sao?</Text>
        <Text style={styles.answer}>Bạn có thể nhấn vào “Quên mật khẩu” ở màn hình đăng nhập để đặt lại.</Text>
      </View>
    </ScrollView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    marginBottom: 20,
  },
  question: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  answer: {
    fontSize: 14,
    marginTop: 5,
    color: '#444',
  },
});
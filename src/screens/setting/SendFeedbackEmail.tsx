import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';

const SendFeedbackEmail = () => {
  const [feedback, setFeedback] = useState('');

  const handleSend = () => {
    if (feedback.trim() === '') {
      Alert.alert('Vui lòng nhập nội dung phản hồi');
      return;
    }
    Alert.alert('Cảm ơn bạn đã gửi phản hồi!');
    setFeedback('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gửi phản hồi</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Nhập nội dung phản hồi tại đây..."
        value={feedback}
        onChangeText={setFeedback}
      />
      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>Gửi</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SendFeedbackEmail;

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
  input: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../constants/ThemeContext';
import { appColors } from '../../constants/appColors';

const HelpAndFeedback = ({navigation}: any) => {
  const { colors } = useTheme();

  const handleSendFeedback = () => {
    navigation.navigate('SendFeedbackEmail');
  };

  const goToFAQ = () => {
    navigation.navigate('FAQScreen');
  };

  const goToInstructions = () => {
    navigation.navigate('InstructionsForUseScreen');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={[styles.title, { color: colors.text }]}>Trợ giúp & Phản hồi</Text>

      <TouchableOpacity style={styles.item} onPress={goToFAQ}>
        <Feather name="help-circle" size={22} color={appColors.primary} />
        <Text style={[styles.itemText, { color: colors.text }]}>Câu hỏi thường gặp (FAQ)</Text>
        <Feather name="chevron-right" size={20} color={colors.tabBarIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={goToInstructions}>
        <Feather name="book-open" size={22} color={appColors.primary} />
        <Text style={[styles.itemText, { color: colors.text }]}>Hướng dẫn sử dụng</Text>
        <Feather name="chevron-right" size={20} color={colors.tabBarIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={handleSendFeedback}>
        <Feather name="mail" size={22} color={appColors.primary} />
        <Text style={[styles.itemText, { color: colors.text }]}>Gửi phản hồi qua Email</Text>
        <Feather name="chevron-right" size={20} color={colors.tabBarIcon} />
      </TouchableOpacity>
    </ScrollView>
  );
};

export default HelpAndFeedback;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    gap: 12,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
});
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import Feather from 'react-native-vector-icons/Feather';

const languages = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: 'Tiếng Trung' },
  { code: 'jp', label: 'Tiếng Nhật' },
];

const LanguageScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('vi');

  const handleSelectLanguage = (code: string) => {
    setSelectedLanguage(code);
  };

  const renderItem = ({ item }: { item: typeof languages[0] }) => {
    const isSelected = item.code === selectedLanguage;
    return (
      <TouchableOpacity
        style={styles.languageItem}
        onPress={() => handleSelectLanguage(item.code)}
      >
        <Text style={styles.languageText}>{item.label}</Text>
        {isSelected && <Feather name="check" size={20} color="#4CAF50" />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={languages}
        keyExtractor={item => item.code}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  languageText: {
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  },
});
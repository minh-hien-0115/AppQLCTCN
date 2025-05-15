import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SearchNormal1} from 'iconsax-react-nativejs';
import {appColors} from '../../constants/appColors';
import auth from '@react-native-firebase/auth';

const HomeScreen = () => {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setDisplayName(user.displayName || '');
    }
    setLoading(false);
  }, []);

  return (
    <ScrollView>
      <View style={styles.header}>
        {loading ? (
          <ActivityIndicator size="large" color={appColors.gray} />
        ) : (
          <Text style={styles.text}>Hello, {displayName || ''}</Text>
        )}
        <SearchNormal1 size={22} color={appColors.gray} />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
  },
});

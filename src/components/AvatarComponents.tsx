import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';

interface Props {
  uri?: string;
}

const AvatarComponents = (props: Props) => {
  const avatarUri = props.uri || 'https://i.pravatar.cc/150?img=3';
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: avatarUri }}
        style={styles.avatar}
      />
    </View>
  );
};

export default AvatarComponents;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  name: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
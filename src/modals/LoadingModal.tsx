import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native'
import React from 'react'
import { appColors } from '../constants/appColors';

interface Props {
    visible: boolean;
    mess?: string;
}
const LoadingModal = (props: Props) => {
    const { visible, mess } = props;
  return (
    <Modal visible={visible} style={{ flex: 1 }} transparent statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent:"center", alignItems:"center"}}>
            <ActivityIndicator color={appColors.white} size={32} />=
            <Text>Loading...</Text>
        </View>
    </Modal>
  )
}

export default LoadingModal

const styles = StyleSheet.create({
    text: {
        color: appColors.white
    }
})
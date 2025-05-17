import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../constants/ThemeContext';

const TOSAndPrivacy = () => {
  const {colors} = useTheme();

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>
        Điều khoản dịch vụ & Chính sách bảo mật
      </Text>

      {/* Điều khoản dịch vụ */}
      <Text style={[styles.sectionTitle, {color: colors.text}]}>
        1. Điều khoản dịch vụ
      </Text>
      <Text style={[styles.content, {color: colors.text}]}>
        - Khi sử dụng ứng dụng này, bạn đồng ý không sử dụng vào các mục đích vi
        phạm pháp luật hoặc trái với đạo đức xã hội.
        {'\n'}- Người dùng chịu trách nhiệm về nội dung thông tin của mình.
        {'\n'}- Chúng tôi có quyền thay đổi nội dung hoặc tạm ngưng dịch vụ bất
        kỳ lúc nào mà không cần báo trước.
      </Text>

      {/* Chính sách bảo mật */}
      <Text style={[styles.sectionTitle, {color: colors.text}]}>
        2. Chính sách bảo mật
      </Text>
      <Text style={[styles.content, {color: colors.text}]}>
        - Ứng dụng thu thập dữ liệu tối thiểu cần thiết để cung cấp dịch vụ.
        {'\n'}- Thông tin cá nhân sẽ được bảo mật tuyệt đối và không chia sẻ cho
        bên thứ ba khi không có sự đồng ý.
        {'\n'}- Người dùng có thể yêu cầu xóa dữ liệu cá nhân bất kỳ lúc nào
        bằng cách liên hệ với chúng tôi.
      </Text>

      {/* Liên hệ */}
      <Text style={[styles.sectionTitle, {color: colors.text}]}>
        3. Liên hệ
      </Text>
      <Text
        style={[styles.content, {color: colors.text, textAlign: 'justify'}]}>
        Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào liên quan đến điều khoản hoặc
        bảo mật, vui lòng liên hệ:
        {'\n'}
        <Text style={{fontWeight: 'bold'}}>Email: support@qlctcn.com</Text>
        {'\n'}
        <Text style={{fontWeight: 'bold'}}>SĐT: 02399998888</Text>
      </Text>
    </ScrollView>
  );
};

export default TOSAndPrivacy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  content: {
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'justify',
  },
});
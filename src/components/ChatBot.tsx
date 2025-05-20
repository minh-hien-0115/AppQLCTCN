import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { chatWithGemini } from '../api/GeminiAPI';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  walletName?: string;
}

const SYSTEM_PROMPT = `Bạn là một trợ lý ảo quản trị viên quản lý chi tiêu cá nhân. Nếu người dùng yêu cầu tạo ví, thêm giao dịch, hoặc thống kê, hãy trả về một JSON hợp lệ, KHÔNG kèm bất kỳ văn bản nào khác, chỉ trả về JSON. Nếu không phải các thao tác trên, hãy trả lời bình thường.

Cấu trúc JSON:
- Tạo ví: { "action": "create_wallet", "name": "Tên ví", "currency": "VND", "balance": 0 }
- Thêm giao dịch: { "action": "add_transaction", "wallet": "Tên ví", "type": "income|expense", "amount": số tiền, "category": "Tên khoản chi", "note": "Ghi chú", "date": "yyyy-MM-dd" }
- Nếu người dùng không chỉ định ví, hãy dùng ví gần nhất. Nếu không có ví nào, yêu cầu tạo ví trước.
- Thống kê: { "action": "statistic", "type": "expense|income|all", "period": "today|week|month" }

Lưu ý:
- Nếu người dùng chat kiểu tự nhiên như 'chi 30k ăn sáng', hãy tự động nhận diện số tiền, tên khoản chi, ghi chú... và tạo JSON add_transaction đúng cấu trúc như trên, ví là ví gần nhất.
- Khi tạo ví xong, chỉ trả về thông báo đã tạo ví và tên ví, không kèm JSON.
- Khi thêm giao dịch thành công, chỉ trả về thông báo số tiền, tên khoản chi, và tên ví, không kèm JSON.
- Khi trả lời người dùng (tạo ví, thêm giao dịch, thống kê, hoặc trả lời thông thường), hãy trả lời dí dỏm, vui vẻ, thân thiện, không quá cứng nhắc.`;

const BOT_INTRO =
  'Xin chào! Tôi là quản trị viên quản lý chi tiêu cá nhân của bạn!';

const ChatBot: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastWallet, setLastWallet] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Load lịch sử chat từ Firestore khi mở chat
  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth().currentUser;
      if (!user) return;
      const userId = user.uid;
      const doc = await firestore().collection('users').doc(userId).collection('chatbot').doc('history').get();
      if (doc.exists()) {
        const data = doc.data();
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
          // Tìm lastWallet từ tin nhắn cuối cùng nếu có
          const last = data.messages.slice().reverse().find(m => m.walletName);
          if (last && last.walletName) setLastWallet(last.walletName);
          return;
        }
      }
      setMessages([{ sender: 'bot', text: BOT_INTRO }]);
    };
    fetchHistory();
  }, []);

  // Lưu lịch sử chat vào Firestore mỗi khi messages thay đổi
  useEffect(() => {
    const saveHistory = async () => {
      const user = auth().currentUser;
      if (!user) return;
      const userId = user.uid;
      await firestore().collection('users').doc(userId).collection('chatbot').doc('history').set({ messages });
    };
    if (messages.length > 0) saveHistory();
  }, [messages]);

  // Xử lý lệnh JSON từ bot
  const handleBotCommand = async (json: any) => {
    const user = auth().currentUser;
    if (!user) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Bạn chưa đăng nhập.' }]);
      return;
    }
    const userId = user.uid;
    if (json.action === 'create_wallet') {
      try {
        const newWalletRef = firestore()
          .collection('users')
          .doc(userId)
          .collection('wallets')
          .doc();
        await newWalletRef.set({
          id: newWalletRef.id,
          name: json.name,
          currency: json.currency || 'VND',
          balance: json.balance || 0,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        setLastWallet(json.name);
        setMessages(prev => [...prev, { sender: 'bot', text: `Đã tạo ví mới: ${json.name}`, walletName: json.name }]);
      } catch (e) {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Không thể tạo ví mới.' }]);
      }
    } else if (json.action === 'add_transaction') {
      try {
        let walletName = json.wallet || lastWallet;
        // Nếu Gemini trả về 'Ví gần nhất' hoặc không có tên ví, tự động tìm ví phù hợp nhất theo nội dung chat
        if (!walletName || walletName.toLowerCase().includes('gần nhất')) {
          // Lấy danh sách ví
          const walletsSnap = await firestore()
            .collection('users')
            .doc(userId)
            .collection('wallets')
            .get();
          const wallets = walletsSnap.docs.map(doc => doc.data().name.toLowerCase());
          // Ưu tiên ví có tên trùng với category hoặc note
          let matchedWallet = null;
          if (json.category) {
            matchedWallet = wallets.find(name => json.category.toLowerCase().includes(name));
          }
          if (!matchedWallet && json.note) {
            matchedWallet = wallets.find(name => json.note.toLowerCase().includes(name));
          }
          // Nếu không khớp, lấy ví đầu tiên
          walletName = matchedWallet || (walletsSnap.size > 0 ? walletsSnap.docs[0].data().name : null);
          setLastWallet(walletName);
        }
        if (!walletName) {
          setMessages(prev => [...prev, { sender: 'bot', text: 'Bạn chưa có ví nào, hãy tạo ví trước nhé!' }]);
          return;
        }
        // Tìm ví theo tên
        const walletSnap = await firestore()
          .collection('users')
          .doc(userId)
          .collection('wallets')
          .where('name', '==', walletName)
          .get();
        if (walletSnap.empty) {
          setMessages(prev => [...prev, { sender: 'bot', text: `Không tìm thấy ví tên "${walletName}".` }]);
          return;
        }
        const walletDoc = walletSnap.docs[0];
        const walletId = walletDoc.id;
        const walletData = walletDoc.data();
        const amount = Number(json.amount);
        const type = json.type;
        const newBalance = type === 'income' ? walletData.balance + amount : walletData.balance - amount;
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('wallets')
          .doc(walletId)
          .collection('transactions')
          .add({
            type,
            category: json.category,
            amount,
            note: json.note || '',
            createdAt: firestore.FieldValue.serverTimestamp(),
            date: json.date || new Date().toISOString().slice(0, 10),
          });
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('wallets')
          .doc(walletId)
          .update({ balance: newBalance });
        setLastWallet(walletName); // lưu lại ví vừa thao tác
        setMessages(prev => [...prev, { sender: 'bot', text: `Đã ghi nhận chi tiêu ${amount.toLocaleString()} cho ${json.category} vào ví ${walletName}`, walletName }]);
      } catch (e) {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Không thể thêm giao dịch.' }]);
      }
    } else if (json.action === 'statistic') {
      try {
        // Lấy tất cả ví
        const walletsSnap = await firestore()
          .collection('users')
          .doc(userId)
          .collection('wallets')
          .get();
        let total = 0;
        let type = json.type;
        let period = json.period;
        let now = new Date();
        for (const walletDoc of walletsSnap.docs) {
          const transSnap = await firestore()
            .collection('users')
            .doc(userId)
            .collection('wallets')
            .doc(walletDoc.id)
            .collection('transactions')
            .get();
          for (const t of transSnap.docs) {
            const data = t.data();
            let match = true;
            if (type !== 'all' && data.type !== type) match = false;
            if (period === 'today') {
              const d = data.createdAt?.toDate?.() || new Date(data.createdAt);
              if (d.toDateString() !== now.toDateString()) match = false;
            }
            // Có thể mở rộng cho week, month nếu cần
            if (match) total += Number(data.amount);
          }
        }
        setMessages(prev => [...prev, { sender: 'bot', text: `Tổng ${type === 'income' ? 'thu nhập' : type === 'expense' ? 'chi tiêu' : 'giao dịch'} ${period === 'today' ? 'hôm nay' : ''}: ${total.toLocaleString()} đ`, walletName: json.type === 'income' ? 'thu nhập' : json.type === 'expense' ? 'chi tiêu' : 'giao dịch' }]);
      } catch (e) {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Không thể thống kê.' }]);
      }
    } else {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Lệnh không hợp lệ hoặc chưa hỗ trợ.' }]);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg: Message = { sender: 'user', text: message };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);
    try {
      // Gửi prompt định hướng kèm câu hỏi user
      const reply = await chatWithGemini(`${SYSTEM_PROMPT}\n\nCâu hỏi của người dùng: ${userMsg.text}`);
      // Tách/làm sạch JSON nếu nằm trong code block hoặc có text thừa
      let jsonStr = reply;
      const codeBlockMatch = reply.match(/```json([\s\S]*?)```|```([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1] || codeBlockMatch[2] || '';
      }
      // Loại bỏ các ký tự không phải JSON ở đầu/cuối
      jsonStr = jsonStr.trim().replace(/^([^{]*)/, '').replace(/([^}]*)$/, '');
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        parsed = null;
      }
      if (parsed && parsed.action) {
        await handleBotCommand(parsed); // chỉ thực hiện, không hiển thị JSON
      } else {
        // Nếu phát hiện có dấu { nhưng không parse được, báo lỗi thân thiện
        if (jsonStr.includes('{') && jsonStr.includes('}')) {
          setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, tôi chưa hiểu yêu cầu hoặc thao tác này. Bạn có thể thử lại hoặc nói rõ hơn nhé!' }]);
        } else {
          setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
        }
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Có lỗi xảy ra khi gọi API.' }]);
    }
    setLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={item.sender === 'user' ? styles.userText : styles.botText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn..."
          editable={!loading}
        />
        <Button title={loading ? '...' : 'Gửi'} onPress={handleSend} disabled={loading} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 0,
    padding: 0,
  },
  chatArea: {
    padding: 16,
    paddingBottom: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#1976d2',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
});

export default ChatBot;

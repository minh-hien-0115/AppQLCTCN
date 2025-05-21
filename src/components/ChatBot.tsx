import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, FlatList, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { chatWithGemini } from '../api/GeminiAPI';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: FirebaseFirestoreTypes.FieldValue | Date;
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

const BOT_INTRO = 'Xin chào! Tôi là quản trị viên quản lý chi tiêu cá nhân của bạn!';

const ChatBot: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastWallet, setLastWallet] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const user = auth().currentUser;

  // Load chat history when component mounts
  useEffect(() => {
    if (!user) return;

    const loadChatHistory = async () => {
      try {
        const chatRef = firestore()
          .collection('users')
          .doc(user.uid)
          .collection('chat_history')
          .orderBy('timestamp', 'asc');

        const unsubscribe = chatRef.onSnapshot(snapshot => {
          if (snapshot.empty) {
            // Nếu chưa có tin nhắn nào, thêm tin nhắn chào mừng
            const welcomeMsg: Message = {
              id: `bot_${Date.now()}`,
              sender: 'bot',
              text: BOT_INTRO,
              timestamp: firestore.FieldValue.serverTimestamp()
            };
            saveMessage(welcomeMsg);
            setMessages([welcomeMsg]);
          } else {
            const loadedMessages: Message[] = [];
            snapshot.forEach(doc => {
              loadedMessages.push(doc.data() as Message);
            });
            setMessages(loadedMessages);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Nếu có lỗi, vẫn hiển thị tin nhắn chào mừng
        const welcomeMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: BOT_INTRO,
          timestamp: firestore.FieldValue.serverTimestamp()
        };
        setMessages([welcomeMsg]);
        saveMessage(welcomeMsg);
      }
    };

    loadChatHistory();
  }, [user]);

  // Save message to Firestore
  const saveMessage = async (message: Message) => {
    if (!user) return;

    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('chat_history')
        .doc(message.id)
        .set(message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Xử lý lệnh JSON từ bot
  const handleBotCommand = async (json: any) => {
    if (!user) {
      const errorMsg: Message = { 
        id: `bot_${Date.now()}`,
        sender: 'bot', 
        text: 'Bạn chưa đăng nhập.', 
        timestamp: firestore.FieldValue.serverTimestamp() 
      };
      setMessages(prev => [...prev, errorMsg]);
      await saveMessage(errorMsg);
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
        const successMsg: Message = { 
          id: `bot_${Date.now()}`,
          sender: 'bot', 
          text: `Đã tạo ví mới: ${json.name}`, 
          timestamp: firestore.FieldValue.serverTimestamp() 
        };
        setMessages(prev => [...prev, successMsg]);
        await saveMessage(successMsg);
      } catch (e) {
        const errorMsg: Message = { 
          id: `bot_${Date.now()}`,
          sender: 'bot', 
          text: 'Không thể tạo ví mới.', 
          timestamp: firestore.FieldValue.serverTimestamp() 
        };
        setMessages(prev => [...prev, errorMsg]);
        await saveMessage(errorMsg);
      }
    } else if (json.action === 'add_transaction') {
      try {
        let walletName = json.wallet || lastWallet;
        if (!walletName || walletName.toLowerCase().includes('gần nhất')) {
          const walletsSnap = await firestore()
            .collection('users')
            .doc(userId)
            .collection('wallets')
            .get();
          const wallets = walletsSnap.docs.map(doc => doc.data().name.toLowerCase());
          let matchedWallet = null;
          if (json.category) {
            matchedWallet = wallets.find(name => json.category.toLowerCase().includes(name));
          }
          if (!matchedWallet && json.note) {
            matchedWallet = wallets.find(name => json.note.toLowerCase().includes(name));
          }
          walletName = matchedWallet || (walletsSnap.size > 0 ? walletsSnap.docs[0].data().name : null);
          setLastWallet(walletName);
        }
        if (!walletName) {
          const errorMsg: Message = { 
            id: `bot_${Date.now()}`,
            sender: 'bot', 
            text: 'Bạn chưa có ví nào, hãy tạo ví trước nhé!', 
            timestamp: firestore.FieldValue.serverTimestamp() 
          };
          setMessages(prev => [...prev, errorMsg]);
          await saveMessage(errorMsg);
          return;
        }
        const walletSnap = await firestore()
          .collection('users')
          .doc(userId)
          .collection('wallets')
          .where('name', '==', walletName)
          .get();
        if (walletSnap.empty) {
          const errorMsg: Message = { 
            id: `bot_${Date.now()}`,
            sender: 'bot', 
            text: `Không tìm thấy ví tên "${walletName}".`, 
            timestamp: firestore.FieldValue.serverTimestamp() 
          };
          setMessages(prev => [...prev, errorMsg]);
          await saveMessage(errorMsg);
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
        setLastWallet(walletName);
        const successMsg: Message = { 
          id: `bot_${Date.now()}`,
          sender: 'bot', 
          text: `Đã ghi nhận chi tiêu ${amount.toLocaleString()} cho ${json.category} vào ví ${walletName}`, 
          timestamp: firestore.FieldValue.serverTimestamp() 
        };
        setMessages(prev => [...prev, successMsg]);
        await saveMessage(successMsg);
      } catch (e) {
        const errorMsg: Message = { 
          id: `bot_${Date.now()}`,
          sender: 'bot', 
          text: 'Không thể thêm giao dịch.', 
          timestamp: firestore.FieldValue.serverTimestamp() 
        };
        setMessages(prev => [...prev, errorMsg]);
        await saveMessage(errorMsg);
      }
    } else if (json.action === 'statistic') {
      try {
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
            if (match) total += Number(data.amount);
          }
        }
        const successMsg: Message = { 
          id: `bot_${Date.now()}`,
          sender: 'bot', 
          text: `Tổng ${type === 'income' ? 'thu nhập' : type === 'expense' ? 'chi tiêu' : 'giao dịch'} ${period === 'today' ? 'hôm nay' : ''}: ${total.toLocaleString()} đ`, 
          timestamp: firestore.FieldValue.serverTimestamp() 
        };
        setMessages(prev => [...prev, successMsg]);
        await saveMessage(successMsg);
      } catch (e) {
        const errorMsg: Message = { 
          id: `bot_${Date.now()}`,
          sender: 'bot', 
          text: 'Không thể thống kê.', 
          timestamp: firestore.FieldValue.serverTimestamp() 
        };
        setMessages(prev => [...prev, errorMsg]);
        await saveMessage(errorMsg);
      }
    } else {
      const errorMsg: Message = { 
        id: `bot_${Date.now()}`,
        sender: 'bot', 
        text: 'Lệnh không hợp lệ hoặc chưa hỗ trợ.', 
        timestamp: firestore.FieldValue.serverTimestamp() 
      };
      setMessages(prev => [...prev, errorMsg]);
      await saveMessage(errorMsg);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    const userMsg: Message = { 
      id: `user_${Date.now()}`,
      sender: 'user', 
      text: message,
      timestamp: firestore.FieldValue.serverTimestamp()
    };
    
    setMessages(prev => [...prev, userMsg]);
    await saveMessage(userMsg);
    setMessage('');
    setLoading(true);

    try {
      const reply = await chatWithGemini(`${SYSTEM_PROMPT}\n\nCâu hỏi của người dùng: ${userMsg.text}`);
      let jsonStr = reply;
      const codeBlockMatch = reply.match(/```json([\s\S]*?)```|```([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1] || codeBlockMatch[2] || '';
      }
      jsonStr = jsonStr.trim().replace(/^([^{]*)/, '').replace(/([^}]*)$/, '');
      
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        parsed = null;
      }

      if (parsed && parsed.action) {
        await handleBotCommand(parsed);
      } else {
        if (jsonStr.includes('{') && jsonStr.includes('}')) {
          const errorMsg: Message = { 
            id: `bot_${Date.now()}`,
            sender: 'bot', 
            text: 'Xin lỗi, tôi chưa hiểu yêu cầu hoặc thao tác này. Bạn có thể thử lại hoặc nói rõ hơn nhé!',
            timestamp: firestore.FieldValue.serverTimestamp()
          };
          setMessages(prev => [...prev, errorMsg]);
          await saveMessage(errorMsg);
        } else {
          const botMsg: Message = { 
            id: `bot_${Date.now()}`,
            sender: 'bot', 
            text: reply,
            timestamp: firestore.FieldValue.serverTimestamp()
          };
          setMessages(prev => [...prev, botMsg]);
          await saveMessage(botMsg);
        }
      }
    } catch {
      const errorMsg: Message = { 
        id: `bot_${Date.now()}`,
        sender: 'bot', 
        text: 'Có lỗi xảy ra khi gọi API.',
        timestamp: firestore.FieldValue.serverTimestamp()
      };
      setMessages(prev => [...prev, errorMsg]);
      await saveMessage(errorMsg);
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
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="none"
          autoComplete="off"
          spellCheck={false}
          multiline={true}
          maxLength={1000}
          blurOnSubmit={false}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading || !message.trim()}
        >
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
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
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#2196f3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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

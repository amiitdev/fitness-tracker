import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ai } from '../../services/api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

interface Section {
  type: 'heading' | 'subheading' | 'text' | 'bullet';
  text: string;
}

function parseSections(text: string): Section[] {
  const lines = text.split('\n').filter(l => l.trim());
  const sections: Section[] = [];

  for (const line of lines) {
    let clean = line
      .replace(/\*\*/g, '').replace(/__/g, '').replace(/~~/g, '')
      .replace(/```?/g, '').replace(/###/g, '').replace(/##/g, '').replace(/#/g, '')
      .replace(/\\/g, '').trim();
    if (!clean) continue;

    if (clean.endsWith(':') && clean.length < 40) {
      sections.push({ type: 'subheading', text: clean.replace(':', '') });
    } else if (clean.startsWith('- ') || clean.startsWith('• ') || clean.startsWith('* ')) {
      sections.push({ type: 'bullet', text: clean.substring(2) });
    } else {
      sections.push({ type: 'text', text: clean });
    }
  }

  return sections;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'ai',
  text: "Hi! I'm your AI calisthenics coach. Ask me anything about bodyweight training, form, workout plans, or nutrition. Try:\n\n• How do I improve my pull-ups?\n• Give me a 15-minute ab routine\n• What should I eat after a workout?",
};

export default function AIChatScreen() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200);
  }, [messages.length]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const data = await ai.chat(text);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: data.reply || 'No response available.',
      };
      setMessages(prev => [...prev, reply]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'Sorry, I had trouble connecting. Please try again.',
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const renderAIMessage = (text: string) => {
    const sections = parseSections(text);

    if (sections.length <= 1) {
      return <Text style={[styles.msgText, { color: theme.colors.text }]}>{text}</Text>;
    }

    return (
      <View>
        {sections.map((s, i) => {
          switch (s.type) {
            case 'subheading':
              return (
                <View key={i} style={[styles.aiSubheading, { borderLeftColor: theme.colors.primary }]}>
                  <Text style={[styles.aiSubheadingText, { color: theme.colors.primary }]}>{s.text}</Text>
                </View>
              );
            case 'bullet':
              return (
                <View key={i} style={styles.aiBulletRow}>
                  <Text style={[styles.aiBullet, { color: theme.colors.primary }]}>•</Text>
                  <Text style={[styles.aiBulletText, { color: theme.colors.text }]}>{s.text}</Text>
                </View>
              );
            default:
              return (
                <Text key={i} style={[styles.aiBody, { color: theme.colors.text }]}>{s.text}</Text>
              );
          }
        })}
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="bulb" size={16} color={theme.colors.primary} />
          </View>
        )}
        <View style={[
          styles.msgBubble,
          isUser
            ? [styles.msgBubbleUser, { backgroundColor: theme.colors.primary }]
            : [styles.msgBubbleAI, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
        ]}>
          {isUser ? (
            <Text style={[styles.msgText, { color: '#fff' }]}>{item.text}</Text>
          ) : (
            renderAIMessage(item.text)
          )}
        </View>
        {isUser && (
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="bulb" size={22} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>AI Chat</Text>
        </View>
        <Text style={[styles.headerSub, { color: theme.colors.textMuted }]}>Your fitness assistant</Text>
      </View>

      <View style={styles.body}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onScrollBeginDrag={Keyboard.dismiss}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={sending ? (
            <View style={styles.sendingRow}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="bulb" size={16} color={theme.colors.primary} />
              </View>
              <View style={[styles.msgBubbleAI, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            </View>
          ) : null}
        />

        <View style={[styles.inputBar, { backgroundColor: theme.colors.tabBar, borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about any exercise..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!input.trim() || sending}
            style={[styles.sendBtn, {
              backgroundColor: input.trim() && !sending ? theme.colors.primary : theme.colors.surfaceAlt,
            }]}
          >
            <Ionicons name="send" size={18} color={input.trim() && !sending ? '#fff' : theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2, marginLeft: 30 },
  listContent: { paddingHorizontal: 16, paddingBottom: 12 },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start' },
  avatar: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  msgBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  msgBubbleUser: { borderBottomRightRadius: 4 },
  msgBubbleAI: { borderBottomLeftRadius: 4, borderWidth: 1 },
  msgText: { fontSize: 15, lineHeight: 21 },
  aiSubheading: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  aiSubheadingText: { fontSize: 15, fontWeight: '700' },
  aiBody: { fontSize: 15, lineHeight: 21, marginBottom: 4 },
  aiBulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 },
  aiBullet: { fontSize: 16, marginRight: 6, marginTop: 1 },
  aiBulletText: { fontSize: 15, lineHeight: 21, flex: 1 },
  sendingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: 1, gap: 8,
  },
  input: {
    flex: 1, borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, maxHeight: 80,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
});

import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const initialMessages = [
  { id: '1', text: 'Hello! How can I help you today?', isUser: false },
];

const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function fetchGroqResponse(userMessage: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are SmartFileChat, an expert AI assistant. You help users with any file type (PDF, CSV, DOC, etc.), accurately convert files to CSV with no data loss, answer questions about file content, and assist with editing CSVs. You also support general chat. Always be clear, concise, and helpful. If a user uploads a file, focus on its data and structure. If the user asks general questions, respond conversationally and informatively." },
        { role: "user", content: userMessage },
      ],
      stream: false,
    }),
  });
  if (!response.ok) throw new Error("Groq API error");
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
}

const ChatScreen = () => {
  const [messages, setMessages] = useState(initialMessages);
  const flatListRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, isUser: true },
    ]);
    setIsTyping(true);
    try {
      const aiReply = await fetchGroqResponse(text);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: aiReply, isUser: false },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: "Error: Unable to get response from AI.", isUser: false },
      ]);
    }
    setIsTyping(false);
  };

  return (
    <View style={styles.outer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ChatGPT</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messages}
        />
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>ChatGPT is typing...</Text>
          </View>
        )}
        <MessageInput onSend={handleSend} isLoading={isTyping} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    backgroundColor: '#10a37f',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f8',
  },
  messages: {
    padding: 16,
    paddingBottom: 8,
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 8,
  },
  typingText: {
    color: '#888',
    fontStyle: 'italic',
  },
});

export default ChatScreen;

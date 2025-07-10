import React, { useEffect, useRef, useState } from 'react';
import { 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  Text, 
  View,
  Dimensions,
  Keyboard
} from 'react-native';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const { height: screenHeight } = Dimensions.get('window');

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
  uploadDate: Date;
}

interface ChatScreenProps {
  uploadedFiles: UploadedFile[];
}

const initialMessages = [
  { id: '1', text: 'Hello! How can I help you today? You can ask me questions about your uploaded files or chat about anything else.', isUser: false, timestamp: new Date() },
];

const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function fetchGroqResponse(userMessage: string, uploadedFiles: UploadedFile[]) {
  try {
    let systemMessage = "You are SmartFileChat, an expert AI assistant. You help users with any file type (PDF, CSV, DOC, etc.), accurately convert files to CSV with no data loss, answer questions about file content, and assist with editing CSVs. You also support general chat. Always be clear, concise, and helpful.";
    
    if (uploadedFiles.length > 0) {
      const fileList = uploadedFiles.map(f => `- ${f.name} (${f.type})`).join('\n');
      systemMessage += `\n\nThe user has uploaded the following files:\n${fileList}\n\nIf they ask about these files, acknowledge them and explain what you could help with if you had access to their content.`;
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });
    
    if (!response.ok) throw new Error("Groq API error");
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
  } catch (error) {
    console.error('API Error:', error);
    return "I'm having trouble connecting right now. Please try again.";
  }
}

const ChatScreen = ({ uploadedFiles }: ChatScreenProps) => {
  const [messages, setMessages] = useState(initialMessages);
  const flatListRef = useRef<FlatList>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, keyboardHeight]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const aiReply = await fetchGroqResponse(text.trim(), uploadedFiles);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: aiReply,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing some technical difficulties. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => (
    <MessageBubble message={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>What can I help with?</Text>
      <Text style={styles.emptySubtitle}>
        Ask me anything or upload files to get AI-powered analysis
      </Text>
      {uploadedFiles.length > 0 && (
        <View style={styles.filesInfo}>
          <Text style={styles.filesInfoTitle}>
            📁 {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
          </Text>
          <Text style={styles.filesInfoSubtitle}>
            Ask me questions about your files!
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages.slice(1)} // Skip the initial greeting for empty state
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messagesList,
              messages.length <= 1 && styles.messagesListEmpty
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />
          
          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </View>
          )}
        </View>
        
        <MessageInput onSend={handleSend} isLoading={isTyping} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messagesListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 100,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  filesInfo: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  filesInfoTitle: {
    color: '#10a37f',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  filesInfoSubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});

export default ChatScreen;
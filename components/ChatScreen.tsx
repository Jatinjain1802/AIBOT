import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import FileMessage from './FileMessage';
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

interface Message {
  id: string;
  text?: string;
  isUser: boolean;
  timestamp: Date;
  file?: UploadedFile;
  type: 'text' | 'file';
}

interface ChatScreenProps {
  uploadedFiles: UploadedFile[];
}

const STORAGE_KEY = '@chat_history';
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function fetchGroqResponse(userMessage: string, uploadedFiles: UploadedFile[], chatHistory: Message[]) {
  try {
    let systemMessage = "You are SmartFileChat, an expert AI assistant specialized in file analysis and general conversation. You help users with any file type (PDF, CSV, DOC, images, etc.), provide accurate file conversions, answer questions about file content, and assist with data analysis. You're also great at general conversation. Always be helpful, clear, and concise.";
    
    if (uploadedFiles.length > 0) {
      const fileList = uploadedFiles.map(f => `- ${f.name} (${f.type}, ${(f.size / 1024).toFixed(1)}KB)`).join('\n');
      systemMessage += `\n\nThe user has uploaded these files:\n${fileList}\n\nWhen they ask about these files, provide helpful insights about what you could analyze if you had access to their content. Mention specific capabilities like data extraction, format conversion, content analysis, etc.`;
    }

    // Include recent chat context (last 10 messages)
    const recentMessages = chatHistory.slice(-10).map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text || (msg.file ? `[File uploaded: ${msg.file.name}]` : '')
    }));

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
          ...recentMessages,
          { role: "user", content: userMessage },
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('API Error:', error);
    if (error.message.includes('rate limit')) {
      return "I'm currently experiencing high demand. Please wait a moment and try again.";
    }
    return "I'm having trouble connecting right now. Please check your internet connection and try again.";
  }
}

const ChatScreen = ({ uploadedFiles }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const typingOpacity = useSharedValue(0);
  const dotScale1 = useSharedValue(1);
  const dotScale2 = useSharedValue(1);
  const dotScale3 = useSharedValue(1);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Keyboard listeners
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, keyboardHeight]);

  // Typing animation
  useEffect(() => {
    if (isTyping) {
      typingOpacity.value = withTiming(1, { duration: 300 });
      
      // Animate dots
      dotScale1.value = withRepeat(
        withTiming(1.3, { duration: 600 }),
        -1,
        true
      );
      dotScale2.value = withRepeat(
        withTiming(1.3, { duration: 600 }),
        -1,
        true
      );
      dotScale3.value = withRepeat(
        withTiming(1.3, { duration: 600 }),
        -1,
        true
      );
    } else {
      typingOpacity.value = withTiming(0, { duration: 300 });
      dotScale1.value = withTiming(1);
      dotScale2.value = withTiming(1);
      dotScale3.value = withTiming(1);
    }
  }, [isTyping]);

  const loadChatHistory = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          ...(msg.file && { file: { ...msg.file, uploadDate: new Date(msg.file.uploadDate) } })
        }));
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatHistory = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const clearChatHistory = () => {
    const clearAction = async () => {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setMessages([]);
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
        clearAction();
      }
    } else {
      Alert.alert(
        'Clear Chat History',
        'Are you sure you want to clear all chat history? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearAction },
        ]
      );
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    await saveChatHistory(newMessages);
    setIsTyping(true);

    try {
      const aiReply = await fetchGroqResponse(text.trim(), uploadedFiles, messages);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiReply,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };
      
      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing some technical difficulties. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };
      
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file: UploadedFile) => {
    const fileMessage: Message = {
      id: Date.now().toString(),
      isUser: true,
      timestamp: new Date(),
      type: 'file',
      file: file,
    };

    const newMessages = [...messages, fileMessage];
    setMessages(newMessages);
    await saveChatHistory(newMessages);

    // Send AI response about the file
    setIsTyping(true);
    try {
      const aiReply = await fetchGroqResponse(
        `I just uploaded a file: ${file.name} (${file.type}). Can you tell me what you could help me with regarding this file?`,
        [file, ...uploadedFiles],
        messages
      );
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiReply,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };
      
      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } catch (error) {
      console.error('Error getting AI response for file:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === 'file' && item.file) {
      return <FileMessage file={item.file} timestamp={item.timestamp} />;
    }
    return <MessageBubble message={item} />;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>What can I help with?</Text>
      <Text style={styles.emptySubtitle}>
        Ask me anything or upload files for AI-powered analysis
      </Text>
      {uploadedFiles.length > 0 && (
        <View style={styles.filesInfo}>
          <Text style={styles.filesInfoTitle}>
            📁 {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} available
          </Text>
          <Text style={styles.filesInfoSubtitle}>
            Ask me questions about your files!
          </Text>
        </View>
      )}
    </View>
  );

  const typingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: typingOpacity.value,
    transform: [
      {
        translateY: interpolate(
          typingOpacity.value,
          [0, 1],
          [20, 0]
        ),
      },
    ],
  }));

  const dot1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale1.value }],
  }));

  const dot2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale2.value }],
  }));

  const dot3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale3.value }],
  }));

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading chat history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {messages.length > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={clearChatHistory}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#ff4444" />
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.messagesListEmpty
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />
          
          <Animated.View style={[styles.typingContainer, typingAnimatedStyle]}>
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <Animated.View style={[styles.dot, dot1AnimatedStyle]} />
                <Animated.View style={[styles.dot, dot2AnimatedStyle]} />
                <Animated.View style={[styles.dot, dot3AnimatedStyle]} />
              </View>
            </View>
          </Animated.View>
        </View>
        
        <MessageInput 
          onSend={handleSend} 
          onFileUpload={handleFileUpload}
          isLoading={isTyping} 
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderBottomLeftRadius: 6,
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
});

export default ChatScreen;
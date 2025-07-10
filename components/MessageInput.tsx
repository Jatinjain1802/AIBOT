import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  View,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Send, Plus, Paperclip } from 'lucide-react-native';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  isLoading?: boolean;
}

const MessageInput = ({ onSend, isLoading }: MessageInputProps) => {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    const messageText = text.trim();
    setText('');
    await onSend(messageText);
  };

  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.attachButton}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Plus size={20} color="#888" />
        </TouchableOpacity>
        
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Message SmartFileChat..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={2000}
            editable={!isLoading}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          
          <TouchableOpacity 
            style={styles.attachIconButton}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Paperclip size={18} color="#666" />
          </TouchableOpacity>
        </View>
        
        {canSend ? (
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        ) : isLoading ? (
          <View style={styles.loadingButton}>
            <ActivityIndicator size="small" color="#10a37f" />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
    paddingVertical: 6,
    paddingRight: 8,
    textAlignVertical: 'center',
  },
  attachIconButton: {
    padding: 4,
    marginBottom: 2,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10a37f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  loadingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});

export default MessageInput;
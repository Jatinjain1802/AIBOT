import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  isLoading?: boolean;
}

const MessageInput = ({ onSend, isLoading }: MessageInputProps) => {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    await onSend(text);
    setText('');
  };

  return (
    <View style={styles.inputBar}>
      <TouchableOpacity style={styles.iconBtn} disabled={isLoading}>
        <Ionicons name="image" size={24} color="#aaa" />
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          placeholderTextColor="#aaa"
          editable={!isLoading}
        />
        {text.trim().length > 0 && !isLoading ? (
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        ) : null}
        {isLoading ? (
          <ActivityIndicator size="small" color="#10a37f" style={{ marginLeft: 8 }} />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232325',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#10a37f',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MessageInput;

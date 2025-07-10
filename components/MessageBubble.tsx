import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.isUser;
  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.botBubble,
        isUser ? styles.alignRight : styles.alignLeft,
      ]}
    >
      <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>{message.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  userBubble: {
    backgroundColor: '#10a37f',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#ececf1',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#222',
  },
});

export default MessageBubble;

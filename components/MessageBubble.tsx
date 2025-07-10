import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Message {
  id: string;
  text?: string;
  isUser: boolean;
  timestamp: Date;
}

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.isUser;
  
  if (!message.text) return null;
  
  return (
    <Animated.View 
      entering={FadeInUp.duration(300).springify()}
      style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>
          {message.text}
        </Text>
      </View>
      <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.botTimestamp]}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#10a37f',
    borderBottomRightRadius: 6,
  },
  botBubble: {
    backgroundColor: '#2a2a2a',
    borderBottomLeftRadius: 6,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
    fontWeight: '500',
  },
  botText: {
    color: '#fff',
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 8,
  },
  userTimestamp: {
    color: '#888',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#888',
    textAlign: 'left',
  },
});

export default MessageBubble;
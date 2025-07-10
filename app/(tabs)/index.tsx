import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ChatScreen from '@/components/ChatScreen';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
  uploadDate: Date;
}

export default function HomeScreen() {
  // For now, we'll use empty array. In a real app, this would be shared state
  const [uploadedFiles] = useState<UploadedFile[]>([]);

  return (
    <View style={styles.container}>
      <ChatScreen uploadedFiles={uploadedFiles} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});
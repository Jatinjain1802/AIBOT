import React from 'react';
import { StyleSheet, View } from 'react-native';
import FileManagerScreen from '@/components/FileManagerScreen';

export default function FilesScreen() {
  return (
    <View style={styles.container}>
      <FileManagerScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});
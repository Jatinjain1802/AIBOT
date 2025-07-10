import React from 'react';
import { StyleSheet, View } from 'react-native';
import MainScreen from '@/components/MainScreen';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <MainScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});
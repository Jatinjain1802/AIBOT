import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet } from 'react-native';

import ChatHomeScreen from '../../components/ChatHomeScreen';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ChatHomeScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#18181a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

import React from 'react';
import { Platform, SafeAreaView, StatusBar } from 'react-native';
import MainScreen from '../components/MainScreen';

export default function Page() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181a', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <MainScreen />
    </SafeAreaView>
  );
}

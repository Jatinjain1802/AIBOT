import React, { useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChatScreen from './ChatScreen';
import FileManagerScreen from './FileManagerScreen';

const TABS = [
  { key: 'chat', label: 'Chats' },
  { key: 'files', label: 'Files' },
];

export default function MainScreen() {
  const [tab, setTab] = useState('chat');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.appName}>SmartFileChat</Text>
        {/* Profile/settings button can go here */}
      </View>
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        {tab === 'chat' ? <ChatScreen /> : <FileManagerScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#18181a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#232325',
    backgroundColor: '#18181a',
  },
  appName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#232325',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#10a37f',
  },
  tabText: {
    color: '#aaa',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#10a37f',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});

import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FileManagerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Files</Text>
      <TouchableOpacity style={styles.uploadBtn}>
        <MaterialIcons name="upload-file" size={28} color="#fff" />
        <Text style={styles.uploadText}>Upload File</Text>
      </TouchableOpacity>
      {/* File list and download/edit options will go here */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>No files uploaded yet.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181a',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10a37f',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 16,
  },
});

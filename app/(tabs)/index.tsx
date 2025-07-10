import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatScreen from '@/components/ChatScreen';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
  uploadDate: Date;
}

const FILES_STORAGE_KEY = '@uploaded_files';

export default function HomeScreen() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    loadUploadedFiles();
  }, []);

  const loadUploadedFiles = async () => {
    try {
      const savedFiles = await AsyncStorage.getItem(FILES_STORAGE_KEY);
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles).map((file: any) => ({
          ...file,
          uploadDate: new Date(file.uploadDate)
        }));
        setUploadedFiles(parsedFiles);
      }
    } catch (error) {
      console.error('Error loading uploaded files:', error);
    }
  };

  const saveUploadedFiles = async (files: UploadedFile[]) => {
    try {
      await AsyncStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
    } catch (error) {
      console.error('Error saving uploaded files:', error);
    }
  };

  const addUploadedFile = (file: UploadedFile) => {
    const newFiles = [file, ...uploadedFiles];
    setUploadedFiles(newFiles);
    saveUploadedFiles(newFiles);
  };

  return (
    <View style={styles.container}>
      <ChatScreen 
        uploadedFiles={uploadedFiles} 
        onFileUpload={addUploadedFile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});
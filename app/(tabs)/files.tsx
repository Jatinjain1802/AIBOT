import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  SafeAreaView,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Upload, FileText, Eye, Trash2, Search, ListFilter as Filter } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
  uploadDate: Date;
}

const FILES_STORAGE_KEY = '@uploaded_files';

export default function FilesScreen() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const saveUploadedFiles = async (files: UploadedFile[]) => {
    try {
      await AsyncStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
    } catch (error) {
      console.error('Error saving uploaded files:', error);
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (limit to 10MB for demo)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size && file.size > maxSize) {
          if (Platform.OS === 'web') {
            alert('File size must be less than 10MB');
          } else {
            Alert.alert('File Too Large', 'File size must be less than 10MB');
          }
          return;
        }

        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size || 0,
          type: file.mimeType || 'unknown',
          uri: file.uri,
          uploadDate: new Date(),
        };

        const newFiles = [newFile, ...uploadedFiles];
        setUploadedFiles(newFiles);
        await saveUploadedFiles(newFiles);
        
        if (Platform.OS === 'web') {
          alert(`File "${file.name}" uploaded successfully!`);
        } else {
          Alert.alert('Success', `File "${file.name}" uploaded successfully!`);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      if (Platform.OS === 'web') {
        alert('Error uploading file. Please try again.');
      } else {
        Alert.alert('Error', 'Error uploading file. Please try again.');
      }
    }
  };

  const handleDownloadFile = async (file: UploadedFile) => {
    try {
      if (Platform.OS === 'web') {
        // For web, create a download link
        const link = document.createElement('a');
        link.href = file.uri;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // For mobile platforms
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'web') {
          alert('Permission required to save files to your device.');
        } else {
          Alert.alert('Permission Required', 'Please grant permission to save files to your device.');
        }
        return;
      }

      // Download the file to a temporary location
      const downloadResult = await FileSystem.downloadAsync(
        file.uri,
        FileSystem.documentDirectory + file.name
      );

      if (downloadResult.status === 200) {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          // Save to media library as fallback
          await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
          if (Platform.OS === 'web') {
            alert(`File saved: ${file.name}`);
          } else {
            Alert.alert('Success', `File saved to your device: ${file.name}`);
          }
        }
      } else {
        if (Platform.OS === 'web') {
          alert('Failed to download file');
        } else {
          Alert.alert('Error', 'Failed to download file');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      if (Platform.OS === 'web') {
        alert('Failed to download file. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to download file. Please try again.');
      }
    }
  };

  const handleDeleteFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    const deleteAction = async () => {
      const newFiles = uploadedFiles.filter(f => f.id !== fileId);
      setUploadedFiles(newFiles);
      await saveUploadedFiles(newFiles);
    };

    if (Platform.OS === 'web') {
      if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
        deleteAction();
      }
    } else {
      Alert.alert(
        'Delete File',
        `Are you sure you want to delete "${file.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: deleteAction },
        ]
      );
    }
  };

  const clearAllFiles = () => {
    const clearAction = async () => {
      setUploadedFiles([]);
      await saveUploadedFiles([]);
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete all files? This cannot be undone.')) {
        clearAction();
      }
    } else {
      Alert.alert(
        'Clear All Files',
        'Are you sure you want to delete all files? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: clearAction },
        ]
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTotalSize = () => {
    const total = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(total);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading files...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Your Files</Text>
          {uploadedFiles.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFiles}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>
        
        {uploadedFiles.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} • {getTotalSize()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={handleFileUpload}
          activeOpacity={0.8}
        >
          <Upload size={24} color="#fff" />
          <Text style={styles.uploadText}>Upload File</Text>
        </TouchableOpacity>

        {uploadedFiles.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color="#444" />
            <Text style={styles.emptyTitle}>No files uploaded yet</Text>
            <Text style={styles.emptySubtitle}>
              Upload documents, spreadsheets, images, or any file type to get started with AI-powered file analysis
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.filesList} showsVerticalScrollIndicator={false}>
            {uploadedFiles.map((file) => (
              <View key={file.id} style={styles.fileItem}>
                <View style={styles.fileIcon}>
                  <FileText size={24} color="#10a37f" />
                </View>
                
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileDetails}>
                    {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                  </Text>
                  <Text style={styles.fileType}>
                    {file.type.split('/')[0] || 'Unknown'} file
                  </Text>
                </View>
                
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDownloadFile(file)}
                    activeOpacity={0.7}
                  >
                    <Eye size={18} color="#10a37f" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteFile(file.id)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    marginTop: 8,
  },
  statsText: {
    color: '#888',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10a37f',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#10a37f',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  filesList: {
    flex: 1,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileDetails: {
    color: '#888',
    fontSize: 14,
    marginBottom: 2,
  },
  fileType: {
    color: '#10a37f',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
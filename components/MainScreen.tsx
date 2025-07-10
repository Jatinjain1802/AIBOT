import React, { useState } from 'react';
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
import { 
  Menu, 
  Upload, 
  FileText, 
  MessageCircle, 
  Download,
  Trash2,
  Eye
} from 'lucide-react-native';
import ChatScreen from './ChatScreen';
import * as DocumentPicker from 'expo-document-picker';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
  uploadDate: Date;
}

export default function MainScreen() {
  const [currentView, setCurrentView] = useState<'chat' | 'files'>('chat');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size || 0,
          type: file.mimeType || 'unknown',
          uri: file.uri,
          uploadDate: new Date(),
        };

        setUploadedFiles(prev => [newFile, ...prev]);
        
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

  const handleDeleteFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    const deleteAction = () => {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
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

  const renderHeader = () => (
    <View style={styles.header}>
      <Menu size={24} color="#fff" />
      <Text style={styles.headerTitle}>SmartFileChat</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabButton, currentView === 'chat' && styles.tabButtonActive]}
        onPress={() => setCurrentView('chat')}
        activeOpacity={0.7}
      >
        <MessageCircle 
          size={20} 
          color={currentView === 'chat' ? '#10a37f' : '#666'} 
        />
        <Text style={[
          styles.tabText, 
          currentView === 'chat' && styles.tabTextActive
        ]}>
          Chat
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabButton, currentView === 'files' && styles.tabButtonActive]}
        onPress={() => setCurrentView('files')}
        activeOpacity={0.7}
      >
        <FileText 
          size={20} 
          color={currentView === 'files' ? '#10a37f' : '#666'} 
        />
        <Text style={[
          styles.tabText, 
          currentView === 'files' && styles.tabTextActive
        ]}>
          Files ({uploadedFiles.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilesView = () => (
    <View style={styles.filesContainer}>
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
            Upload documents, spreadsheets, or any file type to get started with AI-powered file analysis
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
              </View>
              
              <View style={styles.fileActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    // TODO: Implement file preview
                    if (Platform.OS === 'web') {
                      alert('File preview coming soon!');
                    } else {
                      Alert.alert('Info', 'File preview coming soon!');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Eye size={18} color="#666" />
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
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabBar()}
      
      <View style={styles.content}>
        {currentView === 'chat' ? (
          <ChatScreen uploadedFiles={uploadedFiles} />
        ) : (
          renderFilesView()
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 24,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#10a37f',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#10a37f',
  },
  content: {
    flex: 1,
  },
  filesContainer: {
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
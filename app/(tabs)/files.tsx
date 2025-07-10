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
  Upload, 
  FileText, 
  Eye,
  Trash2
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
  uploadDate: Date;
}

export default function FilesScreen() {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Files</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
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
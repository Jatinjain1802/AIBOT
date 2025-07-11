import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  View,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Send, Plus, Paperclip } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
  uploadDate: Date;
}

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onFileUpload?: (file: UploadedFile) => Promise<void>;
  isLoading?: boolean;
}

const MessageInput = ({ onSend, onFileUpload, isLoading }: MessageInputProps) => {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    const messageText = text.trim();
    setText('');
    await onSend(messageText);
  };

  const handleFileUpload = async () => {
    if (isLoading || isUploading) return;
    
    try {
      setIsUploading(true);
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

        const uploadedFile: UploadedFile = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size || 0,
          type: file.mimeType || 'unknown',
          uri: file.uri, // This will be the local file URI
          uploadDate: new Date(),
        };

        if (onFileUpload) {
          await onFileUpload(uploadedFile);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      if (Platform.OS === 'web') {
        alert('Error uploading file. Please try again.');
      } else {
        Alert.alert('Error', 'Error uploading file. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const canSend = text.trim().length > 0 && !isLoading && !isUploading;
  const showAttachButton = !canSend && !isLoading && !isUploading;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={[
            styles.attachButton,
            (isLoading || isUploading) && styles.attachButtonDisabled
          ]}
          onPress={handleFileUpload}
          disabled={isLoading || isUploading}
          activeOpacity={0.7}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#888" />
          ) : (
            <Plus size={20} color="#888" />
          )}
        </TouchableOpacity>
        
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Message SmartFileChat..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={2000}
            editable={!isLoading && !isUploading}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          
          {showAttachButton && (
            <TouchableOpacity 
              style={styles.attachIconButton}
              onPress={handleFileUpload}
              disabled={isLoading || isUploading}
              activeOpacity={0.7}
            >
              <Paperclip size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        {canSend && (
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        )}
        
        {isLoading && (
          <View style={styles.loadingButton}>
            <ActivityIndicator size="small" color="#10a37f" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  attachButtonDisabled: {
    opacity: 0.5,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
    paddingVertical: 6,
    paddingRight: 8,
    textAlignVertical: 'center',
  },
  attachIconButton: {
    padding: 4,
    marginBottom: 2,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10a37f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: '#10a37f',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});

export default MessageInput;
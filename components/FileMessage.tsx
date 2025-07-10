import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { FileText, Image as ImageIcon, FileVideo, Music, Archive, File } from 'lucide-react-native';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
  uploadDate: Date;
}

interface FileMessageProps {
  file: UploadedFile;
  timestamp: Date;
}

const FileMessage = ({ file, timestamp }: FileMessageProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon size={24} color="#10a37f" />;
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo size={24} color="#10a37f" />;
    } else if (mimeType.startsWith('audio/')) {
      return <Music size={24} color="#10a37f" />;
    } else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText size={24} color="#10a37f" />;
    } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
      return <Archive size={24} color="#10a37f" />;
    } else {
      return <File size={24} color="#10a37f" />;
    }
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('document')) return 'Document';
    if (mimeType.includes('spreadsheet')) return 'Spreadsheet';
    if (mimeType.includes('text')) return 'Text';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'Archive';
    return 'File';
  };

  return (
    <View style={styles.container}>
      <View style={styles.fileMessage}>
        <View style={styles.fileIcon}>
          {getFileIcon(file.type)}
        </View>
        
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={2}>
            {file.name}
          </Text>
          <View style={styles.fileDetails}>
            <Text style={styles.fileType}>
              {getFileTypeLabel(file.type)}
            </Text>
            <Text style={styles.fileSeparator}>•</Text>
            <Text style={styles.fileSize}>
              {formatFileSize(file.size)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.previewButton} activeOpacity={0.7}>
          <Text style={styles.previewText}>View</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.timestamp}>
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  fileMessage: {
    backgroundColor: '#10a37f',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    padding: 16,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileType: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  fileSeparator: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginHorizontal: 6,
  },
  fileSize: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  previewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  previewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    marginRight: 8,
  },
});

export default FileMessage;
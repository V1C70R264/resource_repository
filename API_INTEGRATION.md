# DHIS2 API Integration Guide

## Overview

The Resource Repository App is now fully integrated with the DHIS2 Data Store API, providing real-time data persistence and management capabilities. This guide explains how to set up and use the API integration.

## Features

✅ **Real-time Data Persistence** - All files, folders, and metadata are stored in DHIS2 Data Store  
✅ **File Upload & Management** - Upload files directly to DHIS2 with metadata tracking  
✅ **Folder Organization** - Create and manage folder hierarchies  
✅ **Search & Filtering** - Advanced search with API-powered filtering  
✅ **Audit Logging** - Track all file operations and access  
✅ **Access Control** - Manage permissions and user access  
✅ **Settings Management** - Store application configuration  

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root with your DHIS2 instance details:

```env
# DHIS2 Server URL (replace with your actual instance)
VITE_DHIS2_URL=https://your-dhis2-instance.com

# DHIS2 API Credentials
VITE_DHIS2_USERNAME=your-username
VITE_DHIS2_PASSWORD=your-password

# Optional: Custom namespace for data store
VITE_DHIS2_DATASTORE_NAMESPACE=resource-repository

# Optional: Enable debug logging
VITE_DEBUG_MODE=false
```

### 2. DHIS2 Instance Requirements

Your DHIS2 instance must have:
- **Data Store API** enabled (available in DHIS2 2.42+)
- **File Store API** enabled for file uploads
- **User with appropriate permissions** for data store operations

### 3. API Endpoints Used

The app uses the following DHIS2 API endpoints:

#### Data Store API
- `GET /api/dataStore/{namespace}` - Get all keys in namespace
- `GET /api/dataStore/{namespace}/{key}` - Get specific key value
- `POST /api/dataStore/{namespace}/{key}` - Create/update key
- `DELETE /api/dataStore/{namespace}/{key}` - Delete key
- `DELETE /api/dataStore/{namespace}` - Delete entire namespace

#### File Store API
- `POST /api/files` - Upload files
- `GET /api/files/{id}` - Download files
- `DELETE /api/files/{id}` - Delete files

## Data Structure

### Files
```typescript
interface DHIS2File {
  id: string;
  name: string;
  type: 'file';
  fileType?: string;
  mimeType?: string;
  size?: number;
  sizeFormatted?: string;
  modified: string;
  created: string;
  owner: string;
  starred: boolean;
  shared: boolean;
  thumbnail?: string;
  tags: string[];
  language?: string;
  documentType?: string;
  description?: string;
  version?: string;
  parentId?: string;
  path: string;
  content?: string; // Base64 for small files
  url?: string; // URL for larger files
}
```

### Folders
```typescript
interface DHIS2Folder {
  id: string;
  name: string;
  type: 'folder';
  parentId?: string;
  path: string;
  created: string;
  modified: string;
  owner: string;
  description?: string;
  tags: string[];
  permissions: string[];
}
```

## Usage Examples

### 1. File Operations

```typescript
import { useDHIS2DataStore } from '@/hooks/useDHIS2DataStore';

const { uploadFile, saveFile, deleteFile, files } = useDHIS2DataStore();

// Upload a file
const handleUpload = async (file: File) => {
  const uploadedFile = await uploadFile(file, folderId);
  if (uploadedFile) {
    console.log('File uploaded successfully:', uploadedFile);
  }
};

// Save file metadata
const handleSaveMetadata = async (file: FileItem) => {
  const success = await saveFile(file);
  if (success) {
    console.log('File metadata saved');
  }
};

// Delete a file
const handleDelete = async (fileId: string) => {
  const success = await deleteFile(fileId);
  if (success) {
    console.log('File deleted');
  }
};
```

### 2. Folder Operations

```typescript
const { createFolder, saveFolder, deleteFolder, folders } = useDHIS2DataStore();

// Create a new folder
const handleCreateFolder = async (name: string, parentId?: string) => {
  const newFolder = await createFolder(name, parentId);
  if (newFolder) {
    console.log('Folder created:', newFolder);
  }
};

// Save folder metadata
const handleSaveFolder = async (folder: FileItem) => {
  const success = await saveFolder(folder);
  if (success) {
    console.log('Folder saved');
  }
};
```

### 3. Search Operations

```typescript
const { searchFiles } = useDHIS2DataStore();

// Search files with filters
const handleSearch = async (query: string, filters?: any) => {
  const results = await searchFiles(query, filters);
  console.log('Search results:', results);
};
```

### 4. Audit Logging

```typescript
const { saveAuditLog, auditLogs } = useDHIS2DataStore();

// Log a file action
const logFileAction = async (fileId: string, action: string) => {
  const log = {
    id: `log_${Date.now()}`,
    fileId,
    fileName: 'example.pdf',
    action,
    userId: 'current-user',
    userName: 'Current User',
    timestamp: new Date().toISOString(),
    details: 'User performed action'
  };
  
  await saveAuditLog(log);
};
```

## Error Handling

The API integration includes comprehensive error handling:

```typescript
// Check connection status
const { isLoading, hasError, errorFiles } = useDHIS2DataStore();

if (hasError) {
  console.error('API Error:', errorFiles);
}

// Handle specific operation errors
try {
  const result = await uploadFile(file);
  if (!result) {
    console.error('Upload failed');
  }
} catch (error) {
  console.error('Upload error:', error);
}
```

## API Status Component

The app includes a built-in API status indicator that shows:
- Connection status (connected/disconnected)
- Error messages
- Configuration guidance
- Retry functionality

The component appears in the bottom-right corner of the app.

## Development Mode

In development mode, the app will:
1. **Initialize sample data** if no data exists
2. **Show connection status** for debugging
3. **Provide detailed error messages**
4. **Allow configuration changes** without restart

## Production Considerations

For production deployment:

1. **Secure Credentials** - Use environment variables or secure credential management
2. **Error Monitoring** - Implement proper error logging and monitoring
3. **Rate Limiting** - Consider API rate limits for large file operations
4. **Backup Strategy** - Implement regular backups of the data store
5. **Performance** - Monitor API response times and optimize as needed

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check DHIS2 URL and credentials
   - Verify network connectivity
   - Check DHIS2 instance is running

2. **Authentication Errors**
   - Verify username/password
   - Check user permissions in DHIS2
   - Ensure API access is enabled

3. **File Upload Failures**
   - Check file size limits
   - Verify file store API is enabled
   - Check disk space on DHIS2 server

4. **Data Store Errors**
   - Verify data store API is enabled
   - Check namespace permissions
   - Review DHIS2 logs for errors

### Debug Mode

Enable debug mode in your `.env` file:
```env
VITE_DEBUG_MODE=true
```

This will provide detailed console logging for API operations.

## API Documentation

For more details on the DHIS2 APIs used:
- [Data Store API Documentation](https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-242/data-store.html)
- [File Store API Documentation](https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-242/file-resource.html)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Review the API status component
3. Verify your DHIS2 instance configuration
4. Check the DHIS2 server logs
5. Consult the DHIS2 API documentation 
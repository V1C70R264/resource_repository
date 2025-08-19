// DHIS2 Data Store API Integration
// Based on: https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-242/data-store.html

export interface DHIS2DataStoreEntry {
  key: string;
  value: any;
  namespace: string;
  created?: string;
  lastUpdated?: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface DHIS2DataStoreResponse {
  entries: DHIS2DataStoreEntry[];
  pager?: {
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
  };
}

export interface DHIS2DataStoreNamespace {
  namespace: string;
  keyCount: number;
  lastUpdated: string;
}

// Resource Repository specific interfaces
export interface DHIS2File {
  id: string;
  name: string;
  type: 'file' | 'folder';
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
  content?: string; // Base64 encoded content for small files (< 1MB)
  url?: string; // URL for larger files
  checksum?: string; // MD5 or SHA256 hash for file integrity
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  uploadProgress?: number;
  errorMessage?: string;
  trashed?: boolean;
  deletedAt?: string;
}

export interface DHIS2Folder {
  id: string;
  name: string;
  type: 'folder';
  parentId?: string;
  path: string;
  created: string;
  modified: string;
  owner: string;
  starred?: boolean;
  shared?: boolean;
  description?: string;
  tags: string[];
  permissions: any[];
  trashed?: boolean;
  deletedAt?: string;
}

// File upload configuration
const FILE_UPLOAD_CONFIG = {
  MAX_INLINE_SIZE: 50 * 1024 * 1024, // 50MB - files smaller than this will be stored inline
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB - maximum file size
  SUPPORTED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/avi',
    'video/webm',
    'video/quicktime',
    'video/x-matroska',
    'audio/mpeg',
    'audio/wav'
  ]
};

// API Configuration
import { DHIS2_CONFIG, getApiUrl, getAuthHeaders } from '@/config/dhis2';

// Upload progress callback type
type UploadProgressCallback = (progressPercent: number, stage?: string) => void;

// Authentication helper (now imported from config)

// Generic API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = getApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  console.log('[API DEBUG] apiRequest - Endpoint:', endpoint);
  console.log('[API DEBUG] apiRequest - Full URL:', url);
  console.log('[API DEBUG] apiRequest - Method:', options.method || 'GET');
  console.log('[API DEBUG] apiRequest - Headers:', headers);
  if (options.body) {
    console.log('[API DEBUG] apiRequest - Body:', options.body);
  }
  
  try {
    console.log('[API DEBUG] apiRequest - Making fetch request...');
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    console.log('[API DEBUG] apiRequest - Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API DEBUG] apiRequest - Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('[API DEBUG] apiRequest - JSON response:', data);
      return data;
    } else {
      const text = await response.text();
      console.log('[API DEBUG] apiRequest - Text response:', text);
      return text;
    }
  } catch (error) {
    console.error('[API DEBUG] apiRequest - Fetch error:', error);
    throw error;
  }
};

// Upload binary to DHIS2 fileResources with progress and return a persistent data URL
const uploadToFileResources = async (file: File, onProgress?: (pct: number) => void): Promise<string> => {
  const form = new FormData();
  form.append('file', file, file.name);
  const base = getApiUrl('/fileResources');
  const urlWithDomain = `${base}?domain=DOCUMENT`;
  const headers = { ...getAuthHeaders() } as Record<string, string>;
  delete (headers as any)['Content-Type'];

  const xhrPost = (url: string) => new Promise<{ ok: boolean; status: number; statusText: string; json: any }>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    // Set headers
    Object.entries(headers).forEach(([k, v]) => {
      try { xhr.setRequestHeader(k, v as string); } catch {}
    });
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress(pct);
      }
    };
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        const ok = xhr.status >= 200 && xhr.status < 300;
        let json: any = {};
        try { json = JSON.parse(xhr.responseText || '{}'); } catch {}
        resolve({ ok, status: xhr.status, statusText: xhr.statusText, json });
      }
    };
    xhr.send(form);
  });

  let resp = await xhrPost(urlWithDomain);
  if (!resp.ok) {
    // Fallback without domain param
    resp = await xhrPost(base);
    if (!resp.ok) {
      const text = (resp.json && typeof resp.json === 'object') ? JSON.stringify(resp.json) : '';
      throw new Error(`Failed to upload to fileResources: ${resp.status} ${resp.statusText} ${text}`);
    }
  }

  const data = resp.json || {};
  const id = data?.response?.fileResource?.id || data?.id || data?.fileResource?.id || data?.fileResourceId;
  if (!id) throw new Error('fileResource id not returned');
  return getApiUrl(`/fileResources/${id}/data`);
};

// File upload helper function - now properly integrated with DataStore
const uploadFileToDataStore = async (file: File, folderId?: string, onProgress?: UploadProgressCallback): Promise<DHIS2File> => {
  console.log('[API DEBUG] uploadFileToDataStore - Starting upload for file:', file.name, 'size:', file.size);
  
  // Validate file size
  if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    throw new Error(`File size ${file.size} bytes exceeds maximum allowed size of ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE} bytes`);
  }
  
  // Validate file type
  if (!FILE_UPLOAD_CONFIG.SUPPORTED_TYPES.includes(file.type)) {
    console.warn('[API DEBUG] uploadFileToDataStore - Unsupported file type:', file.type);
  }
  
  // Generate unique file ID
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create file metadata
  const fileMetadata: DHIS2File = {
    id: fileId,
    name: file.name,
    type: 'file',
    fileType: getFileTypeFromName(file.name),
    mimeType: file.type,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    modified: new Date().toISOString(),
    created: new Date().toISOString(),
    owner: DHIS2_CONFIG.USERNAME,
    starred: false,
    shared: false,
    tags: [],
    parentId: folderId,
    path: folderId ? `/${folderId}/${file.name}` : `/${file.name}`,
    uploadStatus: 'uploading',
    uploadProgress: 0
  };
  
  try {
    onProgress?.(0, 'Preparing');
    // For small/medium files, store content inline as base64
    if (file.size <= FILE_UPLOAD_CONFIG.MAX_INLINE_SIZE) {
      console.log('[API DEBUG] uploadFileToDataStore - Inline content');
      const READ_WEIGHT = 70; // %
      const CHECKSUM_WEIGHT = 10; // %
      const BEFORE_SAVE_TOTAL = READ_WEIGHT + CHECKSUM_WEIGHT; // 80%
      const content = await fileToBase64(file, (pct) => {
        // Map read progress into READ_WEIGHT band
        const overall = Math.min(READ_WEIGHT * (pct / 100), READ_WEIGHT);
        onProgress?.(overall, 'Reading file');
      });
      fileMetadata.content = content;
      // Checksum stage
      onProgress?.(READ_WEIGHT, 'Generating checksum');
      fileMetadata.checksum = await generateFileChecksum(file);
      onProgress?.(BEFORE_SAVE_TOTAL, 'Finalizing');
    } else {
      console.log('[API DEBUG] uploadFileToDataStore - Uploading to DHIS2 fileResources');
      // Upload to DHIS2 fileResources and store persistent URL
      try {
        const UPLOAD_WEIGHT = 75; // %
        const CHECKSUM_WEIGHT = 10; // %
        const BEFORE_SAVE_TOTAL = UPLOAD_WEIGHT + CHECKSUM_WEIGHT; // 85%
        const persistentUrl = await uploadToFileResources(file, (pct) => {
          const overall = Math.min(UPLOAD_WEIGHT * (pct / 100), UPLOAD_WEIGHT);
          onProgress?.(overall, 'Uploading');
        });
        fileMetadata.url = persistentUrl;
        // Checksum stage
        onProgress?.(UPLOAD_WEIGHT, 'Generating checksum');
        fileMetadata.checksum = await generateFileChecksum(file);
        onProgress?.(BEFORE_SAVE_TOTAL, 'Finalizing');
      } catch (e) {
        console.error('[API DEBUG] uploadFileToDataStore - fileResources upload failed, falling back to blob URL', e);
        try {
          const blobUrl = URL.createObjectURL(file);
          fileMetadata.url = blobUrl;
        } catch {}
        // Even on fallback, mark progress as mostly complete before save
        onProgress?.(85, 'Finalizing');
      }
    }
    
    console.log('[API DEBUG] uploadFileToDataStore - File metadata prepared:', fileMetadata);
    return fileMetadata;
    
  } catch (error) {
    console.error('[API DEBUG] uploadFileToDataStore - Error processing file:', error);
    fileMetadata.uploadStatus = 'error';
    fileMetadata.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw error;
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file: File, onProgress?: (pct: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress(pct);
      }
    };
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      onProgress?.(100);
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// Helper function to generate file checksum (MD5)
const generateFileChecksum = async (file: File): Promise<string> => {
  // For now, return a simple hash based on file properties
  // In production, you might want to use a proper crypto library
  const hashInput = `${file.name}-${file.size}-${file.lastModified}`;
  return btoa(hashInput).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
};

// Helper function to get file type from filename
const getFileTypeFromName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    'pdf': 'PDF Document',
    'doc': 'Word Document',
    'docx': 'Word Document',
    'xls': 'Excel Spreadsheet',
    'xlsx': 'Excel Spreadsheet',
    'ppt': 'PowerPoint Presentation',
    'pptx': 'PowerPoint Presentation',
    'txt': 'Text File',
    'csv': 'CSV File',
    'jpg': 'JPEG Image',
    'jpeg': 'JPEG Image',
    'png': 'PNG Image',
    'gif': 'GIF Image',
    'svg': 'SVG Image',
    'mp4': 'MP4 Video',
    'avi': 'AVI Video',
    'mp3': 'MP3 Audio',
    'wav': 'WAV Audio'
  };
  return typeMap[extension || ''] || 'Unknown File Type';
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Data Store API Class
export class DHIS2DataStoreAPI {
  private namespace: string;
  private currentUserIdCache?: string;

  constructor(namespace: string = DHIS2_CONFIG.DEFAULT_NAMESPACE) {
    this.namespace = namespace;
  }

  private async getCurrentUserId(): Promise<string> {
    if (this.currentUserIdCache) return this.currentUserIdCache;
    try {
      const url = getApiUrl('/me.json?fields=id');
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        this.currentUserIdCache = json?.id || '';
        return this.currentUserIdCache || DHIS2_CONFIG.USERNAME;
      }
    } catch {}
    return DHIS2_CONFIG.USERNAME;
  }

  // 1. GET /api/dataStore/{namespace}
  // Get all keys in a namespace
  async getNamespaceKeys(): Promise<string[]> {
    try {
      console.log('[API DEBUG] getNamespaceKeys - Fetching keys for namespace:', this.namespace);
      const response = await apiRequest(`/dataStore/${this.namespace}`);
      console.log('[API DEBUG] getNamespaceKeys - Raw response:', response);
      
      const keys = response || [];
      console.log('[API DEBUG] getNamespaceKeys - Extracted keys:', keys);
      
      return keys;
    } catch (error) {
      console.error('[API DEBUG] getNamespaceKeys - Error fetching namespace keys:', error);
      return [];
    }
  }

  // 2. GET /api/dataStore/{namespace}/{key}
  // Get a specific key value
  async getKeyValue(key: string): Promise<any> {
    try {
      console.log('[API DEBUG] getKeyValue - Fetching key:', key, 'from namespace:', this.namespace);
      const response = await apiRequest(`/dataStore/${this.namespace}/${key}`);
      console.log('[API DEBUG] getKeyValue - Response for key:', key, response);
      return response;
    } catch (error) {
      console.error(`[API DEBUG] getKeyValue - Error fetching key ${key}:`, error);
      return null;
    }
  }

  // Get a key value with graceful 404 handling
  async getKeyValueSafe(key: string): Promise<any> {
    try {
      console.log('[API DEBUG] getKeyValueSafe - Fetching key:', key, 'from namespace:', this.namespace);
      const url = getApiUrl(`/dataStore/${this.namespace}/${key}`);
      const headers = getAuthHeaders();
      
      console.log('[API DEBUG] getKeyValueSafe - Request URL:', url);
      console.log('[API DEBUG] getKeyValueSafe - Request headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      console.log('[API DEBUG] getKeyValueSafe - Response status:', response.status, response.statusText);
      
      if (response.status === 404) {
        console.log(`[API DEBUG] getKeyValueSafe - Key '${key}' not found, returning null`);
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`DHIS2 API Error: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('[API DEBUG] getKeyValueSafe - Response for key:', key, data);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error(`[API DEBUG] getKeyValueSafe - Error fetching key ${key}:`, error);
      return null;
    }
  }

  // 3. POST /api/dataStore/{namespace}/{key}
  // Set a key value
  async setKeyValue(key: string, value: any): Promise<boolean> {
    try {
      console.log('[API DEBUG] setKeyValue - Setting key:', key, 'in namespace:', this.namespace);
      console.log('[API DEBUG] setKeyValue - Value to set:', value);
      
      // Check if key exists to determine method
      const existingValue = await this.getKeyValueSafe(key);
      const method = existingValue ? 'PUT' : 'POST';
      
      console.log('[API DEBUG] setKeyValue - Using method:', method, 'for key:', key);
      
      const response = await apiRequest(`/dataStore/${this.namespace}/${key}`, {
        method,
        body: JSON.stringify(value),
      });
      
      console.log('[API DEBUG] setKeyValue - Key-value pair saved successfully');
      return true;
    } catch (error) {
      console.error('[API DEBUG] setKeyValue - Error setting key-value pair:', error);
      return false;
    }
  }

  // 4. DELETE /api/dataStore/{namespace}/{key}
  // Delete a specific key
  async deleteKey(key: string): Promise<boolean> {
    try {
      console.log('[API DEBUG] deleteKey - Deleting key:', key, 'from namespace:', this.namespace);
      
      const response = await apiRequest(`/dataStore/${this.namespace}/${key}`, {
        method: 'DELETE',
      });
      
      console.log('[API DEBUG] deleteKey - Key deleted successfully');
      return true;
    } catch (error) {
      console.error('[API DEBUG] deleteKey - Error deleting key:', error);
      return false;
    }
  }

  // 5. DELETE /api/dataStore/{namespace}
  // Delete an entire namespace
  async deleteNamespace(): Promise<boolean> {
    try {
      console.log('[API DEBUG] deleteNamespace - Deleting namespace:', this.namespace);
      
      const response = await apiRequest(`/dataStore/${this.namespace}`, {
        method: 'DELETE',
      });
      
      console.log('[API DEBUG] deleteNamespace - Namespace deleted successfully');
      return true;
    } catch (error) {
      console.error('[API DEBUG] deleteNamespace - Error deleting namespace:', error);
      return false;
    }
  }

  // 6. GET /api/dataStore
  // Get all namespaces
  static async getAllNamespaces(): Promise<DHIS2DataStoreNamespace[]> {
    try {
      console.log('[API DEBUG] getAllNamespaces - Fetching all namespaces');
      const response = await apiRequest('/dataStore');
      console.log('[API DEBUG] getAllNamespaces - Response:', response);
      return response || [];
    } catch (error) {
      console.error('[API DEBUG] getAllNamespaces - Error fetching namespaces:', error);
      return [];
    }
  }

  // Instance method to get all namespaces
  async getAllNamespaces(): Promise<string[]> {
    try {
      const namespaces = await DHIS2DataStoreAPI.getAllNamespaces();
      return namespaces.map(ns => ns.namespace);
    } catch (error) {
      console.error('[API DEBUG] getAllNamespaces - Error:', error);
      return [];
    }
  }

  // 7. POST /api/dataStore/{namespace}
  // Create a new namespace
  async createNamespace(namespace: string): Promise<boolean> {
    try {
      console.log('[API DEBUG] createNamespace - Creating namespace:', namespace);
      
      // Create namespace by setting a temporary key
      const tempKey = `_init_${Date.now()}`;
      const tempValue = { created: new Date().toISOString() };
      
      const response = await apiRequest(`/dataStore/${namespace}/${tempKey}`, {
        method: 'POST',
        body: JSON.stringify(tempValue),
      });
      
      console.log('[API DEBUG] createNamespace - Namespace created successfully');
      
      // Clean up temporary key
      await apiRequest(`/dataStore/${namespace}/${tempKey}`, {
        method: 'DELETE',
      });
      
      return true;
    } catch (error) {
      console.error('[API DEBUG] createNamespace - Error creating namespace:', error);
      return false;
    }
  }

  // File Management - Updated to use DataStore properly
  async saveFile(file: DHIS2File): Promise<boolean> {
    try {
      const key = `file_${file.id}`;
      console.log('[API DEBUG] saveFile - Saving file with key:', key);
      
      // Add retry logic for saving
      let attempts = 0;
      const maxAttempts = 3;
      let success = false;
      
      while (attempts < maxAttempts && !success) {
        attempts++;
        console.log(`[API DEBUG] saveFile - Attempt ${attempts}/${maxAttempts}`);
        
        try {
          const result = await this.setKeyValue(key, file);
          if (result) {
            success = true;
            console.log('[API DEBUG] saveFile - File saved successfully on attempt', attempts);
          } else {
            console.log(`[API DEBUG] saveFile - Attempt ${attempts} failed, result was false`);
          }
        } catch (attemptError) {
          console.error(`[API DEBUG] saveFile - Attempt ${attempts} failed with error:`, attemptError);
          if (attempts === maxAttempts) {
            throw attemptError;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      
      if (success) {
        // Verify the save was successful
        const verificationDelay = 1000;
        await new Promise(resolve => setTimeout(resolve, verificationDelay));
        
        const savedFile = await this.getKeyValue(key);
        if (savedFile && savedFile.id === file.id) {
          console.log('[API DEBUG] saveFile - File verification successful');
          return true;
        } else {
          console.error('[API DEBUG] saveFile - File verification failed - saved data mismatch');
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[API DEBUG] saveFile - Error:', error);
      return false;
    }
  }

  async getFile(fileId: string): Promise<DHIS2File | null> {
    const key = `file_${fileId}`;
    return this.getKeyValue(key);
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const key = `file_${fileId}`;
    return this.deleteKey(key);
  }

  async getAllFiles(): Promise<DHIS2File[]> {
    const keys = await this.getNamespaceKeys();
    const files: DHIS2File[] = [];
    
    for (const key of keys) {
      if (key.startsWith('file_')) {
        const file = await this.getKeyValue(key);
        if (file) {
          files.push(file);
        }
      }
    }
    
    // Filter by current user owner when running inside DHIS2 app
    try {
      const currentUserId = await this.getCurrentUserId();
      return files.filter(f => f.owner === currentUserId);
    } catch {
      return files;
    }
  }

  // Updated uploadFile method - now properly integrated with DataStore
  async uploadFile(file: File, folderId?: string, onProgress?: UploadProgressCallback): Promise<DHIS2File> {
    try {
      console.log('[API DEBUG] uploadFile - Starting file upload:', file.name);
      
      // Process file and create metadata
      const fileMetadata = await uploadFileToDataStore(file, folderId, (pct, stage) => {
        // This covers up to ~80-85%. Saving metadata will complete to 100% below.
        onProgress?.(Math.min(Math.round(pct), 95), stage);
      });
      // Ensure owner is current user id
      fileMetadata.owner = await this.getCurrentUserId();
      
      // Save metadata to DataStore
      onProgress?.(95, 'Saving metadata');
      const saveSuccess = await this.saveFile(fileMetadata);
      if (!saveSuccess) {
        throw new Error('Failed to save file metadata to DataStore');
      }
      
      onProgress?.(100, 'Completed');
      console.log('[API DEBUG] uploadFile - File uploaded and metadata saved successfully');
      return fileMetadata;
      
    } catch (error) {
      console.error('[API DEBUG] uploadFile - Error uploading file:', error);
      throw error;
    }
  }

  // Folder Management
  async saveFolder(folder: DHIS2Folder): Promise<boolean> {
    try {
      const key = `folder_${folder.id}`;
      console.log('[API DEBUG] saveFolder - Saving folder with key:', key, folder);
      
      // Add retry logic for saving
      let attempts = 0;
      const maxAttempts = 3;
      let success = false;
      
      while (attempts < maxAttempts && !success) {
        attempts++;
        console.log(`[API DEBUG] saveFolder - Attempt ${attempts}/${maxAttempts}`);
        
        try {
          const result = await this.setKeyValue(key, folder);
          if (result) {
            success = true;
            console.log('[API DEBUG] saveFolder - Folder saved successfully on attempt', attempts);
          } else {
            console.log(`[API DEBUG] saveFolder - Attempt ${attempts} failed, result was false`);
          }
        } catch (attemptError) {
          console.error(`[API DEBUG] saveFolder - Attempt ${attempts} failed with error:`, attemptError);
          if (attempts === maxAttempts) {
            throw attemptError;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      
      if (success) {
        // Verify the save was successful by trying to retrieve the folder
        const verificationDelay = 1000;
        await new Promise(resolve => setTimeout(resolve, verificationDelay));
        
        const savedFolder = await this.getKeyValue(key);
        if (savedFolder && savedFolder.id === folder.id) {
          console.log('[API DEBUG] saveFolder - Folder verification successful');
          return true;
        } else {
          console.error('[API DEBUG] saveFolder - Folder verification failed - saved data mismatch');
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[API DEBUG] saveFolder - Error:', error);
      return false;
    }
  }

  async getFolder(folderId: string): Promise<DHIS2Folder | null> {
    const key = `folder_${folderId}`;
    return this.getKeyValue(key);
  }

  async deleteFolder(folderId: string): Promise<boolean> {
    const key = `folder_${folderId}`;
    return this.deleteKey(key);
  }

  async getAllFolders(): Promise<DHIS2Folder[]> {
    try {
      console.log('[API DEBUG] getAllFolders - Getting namespace keys...');
      const keys = await this.getNamespaceKeys();
      console.log('[API DEBUG] getAllFolders - All keys:', keys);
      
      const folders: DHIS2Folder[] = [];
      
      for (const key of keys) {
        if (key.startsWith('folder_')) {
          console.log('[API DEBUG] getAllFolders - Processing folder key:', key);
          const folder = await this.getKeyValue(key);
          if (folder) {
            console.log('[API DEBUG] getAllFolders - Found folder:', folder);
            folders.push(folder);
          }
        }
      }
      
      console.log('[API DEBUG] getAllFolders - Total folders found:', folders.length);
      return folders;
    } catch (error) {
      console.error('[API DEBUG] getAllFolders - Error:', error);
      return [];
    }
  }

  async createFolder(name: string, parentId?: string): Promise<DHIS2Folder> {
    try {
      console.log('[API DEBUG] createFolder - Starting folder creation:', { name, parentId });
      
      const folderId = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const folder: DHIS2Folder = {
        id: folderId,
        name,
        type: 'folder',
        parentId,
        path: parentId ? `/${parentId}/${name}` : `/${name}`,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        owner: await this.getCurrentUserId(),
        starred: false,
        shared: false,
        description: '',
        tags: [],
        permissions: [],
      };

      console.log('[API DEBUG] createFolder - Created folder object:', folder);
      
      // Save the folder to the API
      const saveResult = await this.saveFolder(folder);
      if (!saveResult) {
        throw new Error('Failed to save folder to API');
      }
      
      console.log('[API DEBUG] createFolder - Folder saved to API successfully');
      
      // Verify the folder was actually saved by retrieving it from the API
      let verificationAttempts = 0;
      const maxVerificationAttempts = 3;
      let savedFolder: DHIS2Folder | null = null;
      
      while (verificationAttempts < maxVerificationAttempts && !savedFolder) {
        verificationAttempts++;
        console.log(`[API DEBUG] createFolder - Verification attempt ${verificationAttempts}/${maxVerificationAttempts}`);
        
        // Wait a bit before verification
        await new Promise(resolve => setTimeout(resolve, 500 * verificationAttempts));
        
        savedFolder = await this.getFolder(folderId);
        if (savedFolder) {
          console.log('[API DEBUG] createFolder - Folder verified successfully:', savedFolder);
          break;
        } else {
          console.log(`[API DEBUG] createFolder - Verification attempt ${verificationAttempts} failed, folder not found`);
        }
      }
      
      if (!savedFolder) {
        console.error('[API DEBUG] createFolder - Folder verification failed after all attempts');
        // Even if verification fails, return the created folder object
        // The UI can handle this case appropriately
      }
      
      return folder;
    } catch (error) {
      console.error('[API DEBUG] createFolder - Error during folder creation:', error);
      throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // User Management
  async saveUser(user: any): Promise<boolean> {
    const key = `user_${user.id}`;
    return this.setKeyValue(key, user);
  }

  async getUser(userId: string): Promise<any> {
    const key = `user_${userId}`;
    return this.getKeyValue(key);
  }

  async getAllUsers(): Promise<any[]> {
    try {
      // Try live DHIS2 Users API first
      const url = getApiUrl('/users.json?fields=id,name,email&paging=false');
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const users = (data.users || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email || '',
          role: 'viewer',
          permissions: ['read'],
        }));
        if (users.length > 0) {
          return users;
        }
      }
    } catch (e) {
      console.warn('[API DEBUG] Live users fetch failed, falling back to Data Store users');
    }

    // Fallback to Data Store users
    const keys = await this.getNamespaceKeys();
    const users: any[] = [];
    for (const key of keys) {
      if (key.startsWith('user_')) {
        const user = await this.getKeyValue(key);
        if (user) users.push(user);
      }
    }
    if (users.length === 0) {
      const defaults = [
        { id: 'u_admin', name: 'Admin User', email: 'admin@example.org', role: 'admin', permissions: ['*'] },
        { id: 'u_editor', name: 'Editor User', email: 'editor@example.org', role: 'editor', permissions: ['read', 'write'] },
        { id: 'u_viewer', name: 'Viewer User', email: 'viewer@example.org', role: 'viewer', permissions: ['read'] },
      ];
      for (const u of defaults) {
        const key = `user_${u.id}`;
        await this.setKeyValue(key, u);
        users.push(u);
      }
    }
    return users;
  }

  // Organisation Units
  async getAllOrgUnits(): Promise<Array<{ id: string; name: string; displayName?: string; level?: number; parent?: { id: string } }>> {
    try {
      const fields = 'id,name,displayName,level,parent[id]';
      const url = getApiUrl(`/organisationUnits.json?fields=${encodeURIComponent(fields)}&paging=false`);
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.organisationUnits || [];
      }
      return [];
    } catch (e) {
      console.warn('[API DEBUG] getAllOrgUnits failed', e);
      return [];
    }
  }

  // Audit Logging
  async saveAuditLog(log: any): Promise<boolean> {
    const key = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return this.setKeyValue(key, log);
  }

  async getAuditLogs(limit: number = 100): Promise<any[]> {
    const keys = await this.getNamespaceKeys();
    const logs = [];
    
    for (const key of keys) {
      if (key.startsWith('audit_')) {
        const log = await this.getKeyValue(key);
        if (log) {
          logs.push(log);
        }
      }
    }
    
    // Sort by timestamp and limit
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getAllAuditLogs(): Promise<any[]> {
    const keys = await this.getNamespaceKeys();
    const logs: any[] = [];
    for (const key of keys) {
      if (key.startsWith('audit_')) {
        const log = await this.getKeyValue(key);
        if (log) logs.push(log);
      }
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Permissions Management
  async savePermissions(permissions: any[]): Promise<boolean> {
    return this.setKeyValue('permissions', permissions);
  }

  async getPermissions(): Promise<any[]> {
    try {
      const permissions = await this.getKeyValueSafe('permissions');
      return permissions || [];
    } catch (error) {
      console.log('[API DEBUG] getPermissions - Key not found, returning default permissions');
      // If the key doesn't exist, return default permissions
      return [];
    }
  }

  // Settings Management
  async saveSettings(settings: any): Promise<boolean> {
    return this.setKeyValue('settings', settings);
  }

  async getSettings(): Promise<any> {
    try {
      const settings = await this.getKeyValueSafe('settings');
      return settings || {};
    } catch (error) {
      console.log('[API DEBUG] getSettings - Key not found, returning default settings');
      // If the key doesn't exist, return default settings
      return {};
    }
  }

  // Initialize required keys if they don't exist
  async initializeRequiredKeys(): Promise<void> {
    try {
      console.log('[API DEBUG] initializeRequiredKeys - Checking and initializing required keys');
      
      // First, ensure the namespace exists
      console.log('[API DEBUG] initializeRequiredKeys - Step 1: Ensuring namespace exists');
      await this.ensureNamespaceExists();
      console.log('[API DEBUG] initializeRequiredKeys - Step 1 complete: Namespace ensured');
      
      // Check if settings key exists, create with defaults if not
      console.log('[API DEBUG] initializeRequiredKeys - Step 2: Checking settings key');
      const existingSettings = await this.getKeyValueSafe('settings');
      if (existingSettings) {
        console.log('[API DEBUG] initializeRequiredKeys - Settings key already exists:', existingSettings);
      } else {
        console.log('[API DEBUG] initializeRequiredKeys - Creating default settings');
        const defaultSettings = {
          theme: 'light',
          language: 'en',
          itemsPerPage: 20,
          enableNotifications: true,
          autoSave: true
        };
        console.log('[API DEBUG] initializeRequiredKeys - Saving default settings:', defaultSettings);
        await this.saveSettings(defaultSettings);
        console.log('[API DEBUG] initializeRequiredKeys - Default settings saved successfully');
      }

      // Check if permissions key exists, create with defaults if not
      console.log('[API DEBUG] initializeRequiredKeys - Step 3: Checking permissions key');
      const existingPermissions = await this.getKeyValueSafe('permissions');
      if (existingPermissions) {
        console.log('[API DEBUG] initializeRequiredKeys - Permissions key already exists:', existingPermissions);
      } else {
        console.log('[API DEBUG] initializeRequiredKeys - Creating default permissions');
        const defaultPermissions = [
          {
            id: 'admin',
            name: 'Administrator',
            canRead: true,
            canWrite: true,
            canDelete: true,
            canManage: true
          },
          {
            id: 'user',
            name: 'User',
            canRead: true,
            canWrite: false,
            canDelete: false,
            canManage: false
          }
        ];
        console.log('[API DEBUG] initializeRequiredKeys - Saving default permissions:', defaultPermissions);
        await this.savePermissions(defaultPermissions);
        console.log('[API DEBUG] initializeRequiredKeys - Default permissions saved successfully');
      }

      console.log('[API DEBUG] initializeRequiredKeys - All required keys initialized successfully');
    } catch (error) {
      console.error('[API DEBUG] initializeRequiredKeys - Error initializing required keys:', error);
      throw error; // Re-throw to allow proper error handling
    }
  }

  // Ensure the namespace exists, create it if it doesn't
  async ensureNamespaceExists(): Promise<void> {
    try {
      console.log('[API DEBUG] ensureNamespaceExists - Checking if namespace exists:', this.namespace);
      
      // Try to get namespace keys to see if it exists
      const keys = await this.getNamespaceKeys();
      console.log('[API DEBUG] ensureNamespaceExists - Namespace exists, found keys:', keys);
      console.log('[API DEBUG] ensureNamespaceExists - Namespace check complete, namespace is accessible');
    } catch (error) {
      console.log('[API DEBUG] ensureNamespaceExists - Namespace does not exist or not accessible, creating it');
      console.log('[API DEBUG] ensureNamespaceExists - Error details:', error);
      
      // Create the namespace by setting an initial key
      try {
        console.log('[API DEBUG] ensureNamespaceExists - Creating namespace with initialization key');
        await this.setKeyValue('_namespace_init', { created: new Date().toISOString() });
        console.log('[API DEBUG] ensureNamespaceExists - Namespace created successfully');
        
        // Clean up the initialization key
        console.log('[API DEBUG] ensureNamespaceExists - Cleaning up initialization key');
        await this.deleteKey('_namespace_init');
        console.log('[API DEBUG] ensureNamespaceExists - Initialization key cleaned up');
      } catch (createError) {
        console.error('[API DEBUG] ensureNamespaceExists - Failed to create namespace:', createError);
        throw createError;
      }
    }
  }

  // Manual initialization method for testing
  async manualInitialize(): Promise<void> {
    console.log('[API DEBUG] manualInitialize - Starting manual initialization');
    try {
      await this.initializeRequiredKeys();
      console.log('[API DEBUG] manualInitialize - Manual initialization completed successfully');
    } catch (error) {
      console.error('[API DEBUG] manualInitialize - Manual initialization failed:', error);
      throw error;
    }
  }

  // Check if a specific key exists
  async keyExists(key: string): Promise<boolean> {
    try {
      console.log('[API DEBUG] keyExists - Checking if key exists:', key);
      const response = await fetch(getApiUrl(`/dataStore/${this.namespace}/${key}`), {
        method: 'HEAD',
        headers: getAuthHeaders(),
      });
      
      const exists = response.ok;
      console.log('[API DEBUG] keyExists - Key', key, exists ? 'exists' : 'does not exist');
      return exists;
    } catch (error) {
      console.error('[API DEBUG] keyExists - Error checking key existence:', error);
      return false;
    }
  }

  // Get all keys in the namespace with their existence status
  async getNamespaceKeysWithStatus(): Promise<{ key: string; exists: boolean }[]> {
    try {
      console.log('[API DEBUG] getNamespaceKeysWithStatus - Getting all keys with status');
      const keys = await this.getNamespaceKeys();
      const keysWithStatus = await Promise.all(
        keys.map(async (key) => ({
          key,
          exists: await this.keyExists(key)
        }))
      );
      console.log('[API DEBUG] getNamespaceKeysWithStatus - Keys with status:', keysWithStatus);
      return keysWithStatus;
    } catch (error) {
      console.error('[API DEBUG] getNamespaceKeysWithStatus - Error getting keys with status:', error);
      return [];
    }
  }

  // Test API connectivity and namespace access
  async testConnectivity(): Promise<{
    apiAccessible: boolean;
    namespaceAccessible: boolean;
    namespaceExists: boolean;
    keysCount: number;
    error?: string;
  }> {
    try {
      console.log('[API DEBUG] testConnectivity - Testing API connectivity');
      
      // Test basic API access
      let apiAccessible = false;
      try {
        const response = await fetch(getApiUrl('/system/info'), {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        apiAccessible = response.ok;
        console.log('[API DEBUG] testConnectivity - API accessible:', apiAccessible);
      } catch (error) {
        console.log('[API DEBUG] testConnectivity - API not accessible:', error);
      }
      
      // Test namespace access
      let namespaceAccessible = false;
      let namespaceExists = false;
      let keysCount = 0;
      
      try {
        const keys = await this.getNamespaceKeys();
        namespaceAccessible = true;
        namespaceExists = keys.length > 0;
        keysCount = keys.length;
        console.log('[API DEBUG] testConnectivity - Namespace accessible, keys count:', keysCount);
      } catch (error) {
        console.log('[API DEBUG] testConnectivity - Namespace not accessible:', error);
      }
      
      const result = {
        apiAccessible,
        namespaceAccessible,
        namespaceExists,
        keysCount
      };
      
      console.log('[API DEBUG] testConnectivity - Result:', result);
      return result;
    } catch (error) {
      console.error('[API DEBUG] testConnectivity - Error testing connectivity:', error);
      return {
        apiAccessible: false,
        namespaceAccessible: false,
        namespaceExists: false,
        keysCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Search and Filter
  async searchFiles(query: string, filters?: any): Promise<DHIS2File[]> {
    const files = await this.getAllFiles();
    
    return files.filter(file => {
      const matchesQuery = file.name.toLowerCase().includes(query.toLowerCase()) ||
                          file.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
                          file.description?.toLowerCase().includes(query.toLowerCase());
      
      if (!matchesQuery) return false;
      
      if (filters) {
        if (filters.fileTypes?.length && !filters.fileTypes.includes(file.fileType)) return false;
        if (filters.tags?.length && !filters.tags.some(tag => file.tags?.includes(tag))) return false;
        if (filters.starred && !file.starred) return false;
        if (filters.shared && !file.shared) return false;
      }
      
      return true;
    });
  }

  // Utility Methods
  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'pdf': 'document',
      'doc': 'document',
      'docx': 'document',
      'xls': 'spreadsheet',
      'xlsx': 'spreadsheet',
      'ppt': 'presentation',
      'pptx': 'presentation',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'txt': 'text',
      'csv': 'spreadsheet',
    };
    return typeMap[extension || ''] || 'unknown';
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Initialize with sample data for development
  async initializeSampleData(): Promise<void> {
    try {
      // Always initialize required keys first
      await this.initializeRequiredKeys();
      
      const keys = await this.getNamespaceKeys();
      if (keys.length === 0) {
        console.log('Initializing sample data...');
        
        // Create sample folders
        const projectFolder = await this.createFolder('Project Documentation');
        const designFolder = await this.createFolder('Design Assets');
        
        // Create sample files (metadata only for demo)
        const sampleFiles: DHIS2File[] = [
          {
            id: 'file_1',
            name: 'Annual Report 2024.pdf',
            type: 'file',
            fileType: 'document',
            mimeType: 'application/pdf',
            size: 2516582,
            sizeFormatted: '2.4 MB',
            modified: '2024-10-23T10:30:00Z',
            created: '2024-10-18T14:20:00Z',
            owner: 'admin',
            starred: false,
            shared: true,
            tags: ['report', 'finance', 'annual'],
            language: 'en',
            documentType: 'Report',
            description: 'Annual financial report for 2024',
            version: '1.0',
            path: '/Annual Report 2024.pdf',
            uploadStatus: 'completed',
            uploadProgress: 100
          },
          {
            id: 'file_2',
            name: 'User Manual.docx',
            type: 'file',
            fileType: 'document',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            size: 1048576,
            sizeFormatted: '1.0 MB',
            modified: '2024-10-22T16:45:00Z',
            created: '2024-10-15T09:15:00Z',
            owner: 'admin',
            starred: true,
            shared: false,
            tags: ['manual', 'documentation', 'user'],
            language: 'en',
            documentType: 'Manual',
            description: 'User manual for the application',
            version: '2.1',
            path: '/User Manual.docx',
            uploadStatus: 'completed',
            uploadProgress: 100
          }
        ];

        for (const file of sampleFiles) {
          await this.saveFile(file);
        }

        console.log('Sample data initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  /**
   * Test the connectivity and functionality of the DHIS2 API
   * This method helps verify that folders can be properly saved
   */
  async testFolderCreation(): Promise<{
    success: boolean;
    testFolderId?: string;
    error?: string;
    details: {
      namespaceExists: boolean;
      canCreate: boolean;
      canSave: boolean;
      canRetrieve: boolean;
    };
  }> {
    try {
      console.log('[API DEBUG] testFolderCreation - Starting API test');
      
      const result: {
        success: boolean;
        testFolderId?: string;
        error?: string;
        details: {
          namespaceExists: boolean;
          canCreate: boolean;
          canSave: boolean;
          canRetrieve: boolean;
        };
      } = {
        success: false,
        details: {
          namespaceExists: false,
          canCreate: false,
          canSave: false,
          canRetrieve: false,
        }
      };
      
      // Test 1: Check if namespace exists
      try {
        const keys = await this.getNamespaceKeys();
        result.details.namespaceExists = true;
        console.log('[API DEBUG] testFolderCreation - Namespace exists, keys count:', keys.length);
      } catch (error) {
        console.error('[API DEBUG] testFolderCreation - Namespace check failed:', error);
        result.details.namespaceExists = false;
      }
      
      // Test 2: Try to create a test folder
      const testFolderName = `test_${Date.now()}`;
      let testFolder: DHIS2Folder | null = null;
      
      try {
        testFolder = await this.createFolder(testFolderName);
        result.details.canCreate = true;
        result.testFolderId = testFolder.id;
        console.log('[API DEBUG] testFolderCreation - Test folder created successfully:', testFolder.id);
      } catch (error) {
        console.error('[API DEBUG] testFolderCreation - Test folder creation failed:', error);
        result.details.canCreate = false;
        result.error = `Failed to create test folder: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
      
      // Test 3: Try to save a folder
      if (testFolder) {
        try {
          const saveResult = await this.saveFolder(testFolder);
          result.details.canSave = saveResult;
          console.log('[API DEBUG] testFolderCreation - Test folder save result:', saveResult);
        } catch (error) {
          console.error('[API DEBUG] testFolderCreation - Test folder save failed:', error);
          result.details.canSave = false;
        }
      }
      
      // Test 4: Try to retrieve the test folder
      if (testFolder) {
        try {
          const retrievedFolder = await this.getFolder(testFolder.id);
          result.details.canRetrieve = !!retrievedFolder;
          console.log('[API DEBUG] testFolderCreation - Test folder retrieval result:', !!retrievedFolder);
        } catch (error) {
          console.error('[API DEBUG] testFolderCreation - Test folder retrieval failed:', error);
          result.details.canRetrieve = false;
        }
      }
      
      // Determine overall success
      result.success = result.details.namespaceExists && 
                     result.details.canCreate && 
                     result.details.canSave && 
                     result.details.canRetrieve;
      
      // Clean up test folder if it was created
      if (testFolder && result.testFolderId) {
        try {
          await this.deleteFolder(testFolder.id);
          console.log('[API DEBUG] testFolderCreation - Test folder cleaned up');
        } catch (cleanupError) {
          console.error('[API DEBUG] testFolderCreation - Failed to cleanup test folder:', cleanupError);
        }
      }
      
      console.log('[API DEBUG] testFolderCreation - Test completed:', result);
      return result;
      
    } catch (error) {
      console.error('[API DEBUG] testFolderCreation - Test failed with error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          namespaceExists: false,
          canCreate: false,
          canSave: false,
          canRetrieve: false,
        }
      };
    }
  }
}

/**
 * Upload a file to a DHIS2 namespace (folder) as a key-value pair.
 * @param namespace The namespace (folder) to upload to
 * @param file The File object to upload
 * @returns true if successful, false otherwise
 */
export async function uploadFileToNamespace(namespace: string, file: File): Promise<boolean> {
  try {
    // Read file as base64
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Use file.name as the key
    await apiRequest(`/dataStore/${encodeURIComponent(namespace)}/${encodeURIComponent(file.name)}`, {
      method: 'PUT',
      body: JSON.stringify({ name: file.name, content: fileContent }),
    });
    return true;
  } catch (error) {
    // Optionally log error
    return false;
  }
}

// Export default instance for resource repository
export const dataStoreAPI = new DHIS2DataStoreAPI(DHIS2_CONFIG.DEFAULT_NAMESPACE);

// Export for other namespaces if needed
export const createDataStoreAPI = (namespace: string) => new DHIS2DataStoreAPI(namespace); 
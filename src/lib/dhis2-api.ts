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
  content?: string; // Base64 encoded content for small files
  url?: string; // URL for larger files
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
  description?: string;
  tags: string[];
  permissions: string[];
}

// API Configuration
const DHIS2_BASE_URL = import.meta.env.VITE_DHIS2_URL || 'https://your-dhis2-instance.com';
const DHIS2_USERNAME = import.meta.env.VITE_DHIS2_USERNAME || 'admin';
const DHIS2_PASSWORD = import.meta.env.VITE_DHIS2_PASSWORD || 'district';

// Authentication helper
const getAuthHeaders = () => {
  const credentials = btoa(`${DHIS2_USERNAME}:${DHIS2_PASSWORD}`);
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  };
};

// Generic API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${DHIS2_BASE_URL}/api${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`DHIS2 API Error: ${response.status} ${response.statusText}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return null;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
};

// File upload helper
const uploadFile = async (file: File, folderId?: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  if (folderId) {
    formData.append('folderId', folderId);
  }

  const url = `${DHIS2_BASE_URL}/api/files`;
  const credentials = btoa(`${DHIS2_USERNAME}:${DHIS2_PASSWORD}`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.id;
};

// Data Store API Class
export class DHIS2DataStoreAPI {
  private namespace: string;

  constructor(namespace: string = 'resource-repository') {
    this.namespace = namespace;
  }

  // 1. GET /api/dataStore/{namespace}
  // Get all keys in a namespace
  async getNamespaceKeys(): Promise<string[]> {
    try {
      const response = await apiRequest(`/dataStore/${this.namespace}`);
      return response || [];
    } catch (error) {
      console.error('Error fetching namespace keys:', error);
      return [];
    }
  }

  // 2. GET /api/dataStore/{namespace}/{key}
  // Get a specific key value
  async getKeyValue(key: string): Promise<any> {
    try {
      const response = await apiRequest(`/dataStore/${this.namespace}/${key}`);
      return response;
    } catch (error) {
      console.error(`Error fetching key ${key}:`, error);
      return null;
    }
  }

  // 3. POST /api/dataStore/{namespace}/{key}
  // Create or update a key
  async setKeyValue(key: string, value: any): Promise<boolean> {
    try {
      await apiRequest(`/dataStore/${this.namespace}/${key}`, {
        method: 'POST',
        body: JSON.stringify(value),
      });
      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  // 4. DELETE /api/dataStore/{namespace}/{key}
  // Delete a specific key
  async deleteKey(key: string): Promise<boolean> {
    try {
      await apiRequest(`/dataStore/${this.namespace}/${key}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  // 5. DELETE /api/dataStore/{namespace}
  // Delete entire namespace
  async deleteNamespace(): Promise<boolean> {
    try {
      await apiRequest(`/dataStore/${this.namespace}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting namespace ${this.namespace}:`, error);
      return false;
    }
  }

  // 6. GET /api/dataStore
  // Get all namespaces
  static async getAllNamespaces(): Promise<DHIS2DataStoreNamespace[]> {
    try {
      const response = await apiRequest('/dataStore');
      return response || [];
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      return [];
    }
  }

  /**
   * Creates a new namespace (folder) in the DHIS2 Data Store.
   * @param namespace The name of the namespace (folder) to create
   * @returns true if successful, false otherwise
   */
  async createNamespace(namespace: string): Promise<boolean> {
    try {
      await apiRequest(`/dataStore/${encodeURIComponent(namespace)}`, {
        method: 'POST',
        body: JSON.stringify({}), // Can be empty or initial data
      });
      return true;
    } catch (error) {
      // Optionally log error
      return false;
    }
  }

  // Resource Repository Specific Methods

  // File Management
  async saveFile(file: DHIS2File): Promise<boolean> {
    const key = `file_${file.id}`;
    return this.setKeyValue(key, file);
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
    
    return files;
  }

  async uploadFile(file: File, folderId?: string): Promise<DHIS2File> {
    try {
      // Upload file to DHIS2 file store
      const fileId = await uploadFile(file, folderId);
      
      // Create file metadata
      const fileMetadata: DHIS2File = {
        id: fileId,
        name: file.name,
        type: 'file',
        fileType: this.getFileType(file.name),
        mimeType: file.type,
        size: file.size,
        sizeFormatted: this.formatFileSize(file.size),
        modified: new Date().toISOString(),
        created: new Date().toISOString(),
        owner: DHIS2_USERNAME,
        starred: false,
        shared: false,
        tags: [],
        parentId: folderId,
        path: folderId ? `/${folderId}/${file.name}` : `/${file.name}`,
      };

      // Save metadata to data store
      await this.saveFile(fileMetadata);
      
      return fileMetadata;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Folder Management
  async saveFolder(folder: DHIS2Folder): Promise<boolean> {
    const key = `folder_${folder.id}`;
    return this.setKeyValue(key, folder);
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
    const keys = await this.getNamespaceKeys();
    const folders: DHIS2Folder[] = [];
    
    for (const key of keys) {
      if (key.startsWith('folder_')) {
        const folder = await this.getKeyValue(key);
        if (folder) {
          folders.push(folder);
        }
      }
    }
    
    return folders;
  }

  async createFolder(name: string, parentId?: string): Promise<DHIS2Folder> {
    const folderId = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const folder: DHIS2Folder = {
      id: folderId,
      name,
      type: 'folder',
      parentId,
      path: parentId ? `/${parentId}/${name}` : `/${name}`,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      owner: DHIS2_USERNAME,
      description: '',
      tags: [],
      permissions: [],
    };

    await this.saveFolder(folder);
    return folder;
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
    const keys = await this.getNamespaceKeys();
    const users = [];
    
    for (const key of keys) {
      if (key.startsWith('user_')) {
        const user = await this.getKeyValue(key);
        if (user) {
          users.push(user);
        }
      }
    }
    
    return users;
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

  // Permissions Management
  async savePermissions(permissions: any[]): Promise<boolean> {
    return this.setKeyValue('permissions', permissions);
  }

  async getPermissions(): Promise<any[]> {
    const permissions = await this.getKeyValue('permissions');
    return permissions || [];
  }

  // Settings Management
  async saveSettings(settings: any): Promise<boolean> {
    return this.setKeyValue('settings', settings);
  }

  async getSettings(): Promise<any> {
    const settings = await this.getKeyValue('settings');
    return settings || {};
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
            path: '/Annual Report 2024.pdf'
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
            path: '/User Manual.docx'
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
export const dataStoreAPI = new DHIS2DataStoreAPI('resource-repository');

// Export for other namespaces if needed
export const createDataStoreAPI = (namespace: string) => new DHIS2DataStoreAPI(namespace); 
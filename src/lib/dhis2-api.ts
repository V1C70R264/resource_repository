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

// API Configuration
const DHIS2_BASE_URL = import.meta.env.VITE_DHIS2_URL;
const DHIS2_USERNAME = import.meta.env.VITE_DHIS2_USERNAME;
const DHIS2_PASSWORD = import.meta.env.VITE_DHIS2_PASSWORD;

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

  return response.json();
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
      return response;
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
      return response;
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      return [];
    }
  }

  // Resource Repository Specific Methods
  async saveFile(file: any): Promise<boolean> {
    const key = `file_${file.id}`;
    return this.setKeyValue(key, file);
  }

  async getFile(fileId: string): Promise<any> {
    const key = `file_${fileId}`;
    return this.getKeyValue(key);
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const key = `file_${fileId}`;
    return this.deleteKey(key);
  }

  async getAllFiles(): Promise<any[]> {
    const keys = await this.getNamespaceKeys();
    const files = [];
    
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

  async saveFolder(folder: any): Promise<boolean> {
    const key = `folder_${folder.id}`;
    return this.setKeyValue(key, folder);
  }

  async getFolder(folderId: string): Promise<any> {
    const key = `folder_${folderId}`;
    return this.getKeyValue(key);
  }

  async deleteFolder(folderId: string): Promise<boolean> {
    const key = `folder_${folderId}`;
    return this.deleteKey(key);
  }

  async getAllFolders(): Promise<any[]> {
    const keys = await this.getNamespaceKeys();
    const folders = [];
    
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

  async savePermissions(permissions: any[]): Promise<boolean> {
    return this.setKeyValue('permissions', permissions);
  }

  async getPermissions(): Promise<any[]> {
    const permissions = await this.getKeyValue('permissions');
    return permissions || [];
  }

  async saveSettings(settings: any): Promise<boolean> {
    return this.setKeyValue('settings', settings);
  }

  async getSettings(): Promise<any> {
    const settings = await this.getKeyValue('settings');
    return settings || {};
  }
}

// Export default instance for resource repository
export const dataStoreAPI = new DHIS2DataStoreAPI('resource-repository');

// Export for other namespaces if needed
export const createDataStoreAPI = (namespace: string) => new DHIS2DataStoreAPI(namespace); 
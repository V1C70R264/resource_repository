import { useState, useEffect, useCallback } from 'react';
import { dataStoreAPI, DHIS2DataStoreAPI, DHIS2File, DHIS2Folder } from '@/lib/dhis2-api';
import { FileItem } from '@/lib/types';
import { AuditLog, User, Permission } from '@/lib/types';

interface UseDHIS2DataStoreReturn {
  // Files
  files: FileItem[];
  loadingFiles: boolean;
  errorFiles: string | null;
  saveFile: (file: FileItem) => Promise<boolean>;
  deleteFile: (fileId: string) => Promise<boolean>;
  uploadFile: (file: File, folderId?: string) => Promise<FileItem | null>;
  refreshFiles: () => Promise<void>;

  // Folders
  folders: FileItem[];
  loadingFolders: boolean;
  errorFolders: string | null;
  saveFolder: (folder: FileItem) => Promise<boolean>;
  createFolder: (name: string, parentId?: string) => Promise<FileItem | null>;
  deleteFolder: (folderId: string) => Promise<boolean>;
  refreshFolders: () => Promise<void>;

  // Users
  users: User[];
  loadingUsers: boolean;
  errorUsers: string | null;
  saveUser: (user: User) => Promise<boolean>;
  refreshUsers: () => Promise<void>;

  // Audit Logs
  auditLogs: AuditLog[];
  loadingAuditLogs: boolean;
  errorAuditLogs: string | null;
  saveAuditLog: (log: AuditLog) => Promise<boolean>;
  refreshAuditLogs: () => Promise<void>;

  // Permissions
  permissions: Permission[];
  loadingPermissions: boolean;
  errorPermissions: string | null;
  savePermissions: (permissions: Permission[]) => Promise<boolean>;
  refreshPermissions: () => Promise<void>;

  // Settings
  settings: any;
  loadingSettings: boolean;
  errorSettings: string | null;
  saveSettings: (settings: any) => Promise<boolean>;
  refreshSettings: () => Promise<void>;

  // Search
  searchFiles: (query: string, filters?: any) => Promise<FileItem[]>;

  // General
  api: DHIS2DataStoreAPI;
  isLoading: boolean;
  hasError: boolean;
  initializeData: () => Promise<void>;
}

export const useDHIS2DataStore = (): UseDHIS2DataStoreReturn => {
  // State for files
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorFiles, setErrorFiles] = useState<string | null>(null);

  // State for folders
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [errorFolders, setErrorFolders] = useState<string | null>(null);

  // State for users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  // State for audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [errorAuditLogs, setErrorAuditLogs] = useState<string | null>(null);

  // State for permissions
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [errorPermissions, setErrorPermissions] = useState<string | null>(null);

  // State for settings
  const [settings, setSettings] = useState<any>({});
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [errorSettings, setErrorSettings] = useState<string | null>(null);

  // Convert DHIS2File to FileItem
  const convertDHIS2FileToFileItem = (dhis2File: DHIS2File): FileItem => {
    return {
      id: dhis2File.id,
      name: dhis2File.name,
      type: dhis2File.type,
      fileType: dhis2File.fileType,
      mimeType: dhis2File.mimeType,
      size: dhis2File.size,
      sizeFormatted: dhis2File.sizeFormatted,
      modified: dhis2File.modified,
      created: dhis2File.created,
      owner: dhis2File.owner,
      starred: dhis2File.starred,
      shared: dhis2File.shared,
      thumbnail: dhis2File.thumbnail,
      tags: dhis2File.tags,
      language: dhis2File.language,
      documentType: dhis2File.documentType,
      description: dhis2File.description,
      version: dhis2File.version,
      parentId: dhis2File.parentId,
      path: dhis2File.path,
    };
  };

  // Convert DHIS2Folder to FileItem
  const convertDHIS2FolderToFileItem = (dhis2Folder: DHIS2Folder): FileItem => {
    return {
      id: dhis2Folder.id,
      name: dhis2Folder.name,
      type: 'folder',
      fileType: 'folder',
      mimeType: 'application/x-directory',
      size: 0,
      sizeFormatted: '0 B',
      modified: dhis2Folder.modified,
      created: dhis2Folder.created,
      owner: dhis2Folder.owner,
      starred: false,
      shared: false,
      tags: dhis2Folder.tags,
      parentId: dhis2Folder.parentId,
      path: dhis2Folder.path,
      description: dhis2Folder.description,
    };
  };

  // File operations
  const refreshFiles = useCallback(async () => {
    setLoadingFiles(true);
    setErrorFiles(null);
    try {
      const fetchedFiles = await dataStoreAPI.getAllFiles();
      const convertedFiles = fetchedFiles.map(convertDHIS2FileToFileItem);
      setFiles(convertedFiles);
    } catch (error) {
      setErrorFiles(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  const saveFile = useCallback(async (file: FileItem): Promise<boolean> => {
    try {
      const dhis2File: DHIS2File = {
        id: file.id,
        name: file.name,
        type: file.type,
        fileType: file.fileType,
        mimeType: file.mimeType,
        size: file.size,
        sizeFormatted: file.sizeFormatted,
        modified: file.modified,
        created: file.created,
        owner: file.owner,
        starred: file.starred,
        shared: file.shared,
        thumbnail: file.thumbnail,
        tags: file.tags,
        language: file.language,
        documentType: file.documentType,
        description: file.description,
        version: file.version,
        parentId: file.parentId,
        path: file.path,
      };
      
      const success = await dataStoreAPI.saveFile(dhis2File);
      if (success) {
        await refreshFiles();
      }
      return success;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  }, [refreshFiles]);

  const uploadFile = useCallback(async (file: File, folderId?: string): Promise<FileItem | null> => {
    try {
      const uploadedFile = await dataStoreAPI.uploadFile(file, folderId);
      const convertedFile = convertDHIS2FileToFileItem(uploadedFile);
      await refreshFiles();
      return convertedFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }, [refreshFiles]);

  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      const success = await dataStoreAPI.deleteFile(fileId);
      if (success) {
        await refreshFiles();
      }
      return success;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }, [refreshFiles]);

  // Folder operations
  const refreshFolders = useCallback(async () => {
    setLoadingFolders(true);
    setErrorFolders(null);
    try {
      const fetchedFolders = await dataStoreAPI.getAllFolders();
      const convertedFolders = fetchedFolders.map(convertDHIS2FolderToFileItem);
      setFolders(convertedFolders);
    } catch (error) {
      setErrorFolders(error instanceof Error ? error.message : 'Failed to load folders');
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const saveFolder = useCallback(async (folder: FileItem): Promise<boolean> => {
    try {
      const dhis2Folder: DHIS2Folder = {
        id: folder.id,
        name: folder.name,
        type: 'folder',
        parentId: folder.parentId,
        path: folder.path,
        created: folder.created,
        modified: folder.modified,
        owner: folder.owner,
        description: folder.description,
        tags: folder.tags,
        permissions: [],
      };
      
      const success = await dataStoreAPI.saveFolder(dhis2Folder);
      if (success) {
        await refreshFolders();
      }
      return success;
    } catch (error) {
      console.error('Error saving folder:', error);
      return false;
    }
  }, [refreshFolders]);

  const createFolder = useCallback(async (name: string, parentId?: string): Promise<FileItem | null> => {
    try {
      const createdFolder = await dataStoreAPI.createFolder(name, parentId);
      const convertedFolder = convertDHIS2FolderToFileItem(createdFolder);
      await refreshFolders();
      return convertedFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }, [refreshFolders]);

  const deleteFolder = useCallback(async (folderId: string): Promise<boolean> => {
    try {
      const success = await dataStoreAPI.deleteFolder(folderId);
      if (success) {
        await refreshFolders();
      }
      return success;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  }, [refreshFolders]);

  // User operations
  const refreshUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const fetchedUsers = await dataStoreAPI.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      setErrorUsers(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const saveUser = useCallback(async (user: User): Promise<boolean> => {
    try {
      const success = await dataStoreAPI.saveUser(user);
      if (success) {
        await refreshUsers();
      }
      return success;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  }, [refreshUsers]);

  // Audit log operations
  const refreshAuditLogs = useCallback(async () => {
    setLoadingAuditLogs(true);
    setErrorAuditLogs(null);
    try {
      const fetchedLogs = await dataStoreAPI.getAuditLogs();
      setAuditLogs(fetchedLogs);
    } catch (error) {
      setErrorAuditLogs(error instanceof Error ? error.message : 'Failed to load audit logs');
    } finally {
      setLoadingAuditLogs(false);
    }
  }, []);

  const saveAuditLog = useCallback(async (log: AuditLog): Promise<boolean> => {
    try {
      const success = await dataStoreAPI.saveAuditLog(log);
      if (success) {
        await refreshAuditLogs();
      }
      return success;
    } catch (error) {
      console.error('Error saving audit log:', error);
      return false;
    }
  }, [refreshAuditLogs]);

  // Permission operations
  const refreshPermissions = useCallback(async () => {
    setLoadingPermissions(true);
    setErrorPermissions(null);
    try {
      const fetchedPermissions = await dataStoreAPI.getPermissions();
      setPermissions(fetchedPermissions);
    } catch (error) {
      setErrorPermissions(error instanceof Error ? error.message : 'Failed to load permissions');
    } finally {
      setLoadingPermissions(false);
    }
  }, []);

  const savePermissions = useCallback(async (permissions: Permission[]): Promise<boolean> => {
    try {
      const success = await dataStoreAPI.savePermissions(permissions);
      if (success) {
        await refreshPermissions();
      }
      return success;
    } catch (error) {
      console.error('Error saving permissions:', error);
      return false;
    }
  }, [refreshPermissions]);

  // Settings operations
  const refreshSettings = useCallback(async () => {
    setLoadingSettings(true);
    setErrorSettings(null);
    try {
      const fetchedSettings = await dataStoreAPI.getSettings();
      setSettings(fetchedSettings);
    } catch (error) {
      setErrorSettings(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const saveSettings = useCallback(async (settings: any): Promise<boolean> => {
    try {
      const success = await dataStoreAPI.saveSettings(settings);
      if (success) {
        await refreshSettings();
      }
      return success;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }, [refreshSettings]);

  // Search operations
  const searchFiles = useCallback(async (query: string, filters?: any): Promise<FileItem[]> => {
    try {
      const searchResults = await dataStoreAPI.searchFiles(query, filters);
      return searchResults.map(convertDHIS2FileToFileItem);
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }, []);

  // Initialize data
  const initializeData = useCallback(async () => {
    try {
      // Initialize sample data if needed
      await dataStoreAPI.initializeSampleData();
      
      // Load all data
      await Promise.all([
        refreshFiles(),
        refreshFolders(),
        refreshUsers(),
        refreshAuditLogs(),
        refreshPermissions(),
        refreshSettings(),
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }, [refreshFiles, refreshFolders, refreshUsers, refreshAuditLogs, refreshPermissions, refreshSettings]);

  // Load initial data
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Computed values
  const isLoading = loadingFiles || loadingFolders || loadingUsers || loadingAuditLogs || loadingPermissions || loadingSettings;
  const hasError = !!(errorFiles || errorFolders || errorUsers || errorAuditLogs || errorPermissions || errorSettings);

  return {
    // Files
    files,
    loadingFiles,
    errorFiles,
    saveFile,
    deleteFile,
    uploadFile,
    refreshFiles,

    // Folders
    folders,
    loadingFolders,
    errorFolders,
    saveFolder,
    createFolder,
    deleteFolder,
    refreshFolders,

    // Users
    users,
    loadingUsers,
    errorUsers,
    saveUser,
    refreshUsers,

    // Audit Logs
    auditLogs,
    loadingAuditLogs,
    errorAuditLogs,
    saveAuditLog,
    refreshAuditLogs,

    // Permissions
    permissions,
    loadingPermissions,
    errorPermissions,
    savePermissions,
    refreshPermissions,

    // Settings
    settings,
    loadingSettings,
    errorSettings,
    saveSettings,
    refreshSettings,

    // Search
    searchFiles,

    // General
    api: dataStoreAPI,
    isLoading,
    hasError,
    initializeData,
  };
}; 
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
  moveToTrash: (item: FileItem) => Promise<boolean>;

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
    const converted = {
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
      trashed: dhis2File.trashed || false,
      deletedAt: dhis2File.deletedAt,
      // Preserve preview data
      content: dhis2File.content,
      url: dhis2File.url,
      checksum: dhis2File.checksum,
    };
    
    console.log(`[DEBUG] Converting file "${dhis2File.name}":`, {
      hasContent: !!dhis2File.content,
      hasUrl: !!dhis2File.url,
      hasChecksum: !!dhis2File.checksum,
      converted: {
        hasContent: !!converted.content,
        hasUrl: !!converted.url,
        hasChecksum: !!converted.checksum
      }
    });
    
    return converted;
  };

  // Convert DHIS2Folder to FileItem
  const convertDHIS2FolderToFileItem = (dhis2Folder: DHIS2Folder): FileItem => {
    const f: any = dhis2Folder as any;
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
      starred: dhis2Folder.starred || false,
      shared: dhis2Folder.shared || false,
      tags: dhis2Folder.tags,
      parentId: dhis2Folder.parentId,
      path: dhis2Folder.path,
      description: dhis2Folder.description,
      trashed: Boolean(f.trashed),
      deletedAt: f.deletedAt,
    } as FileItem;
  };

  // File operations
  const refreshFiles = useCallback(async () => {
    setLoadingFiles(true);
    setErrorFiles(null);
    try {
      const fetchedFiles = await dataStoreAPI.getAllFiles();
      console.log('[DEBUG] refreshFiles - Raw DHIS2 files:', fetchedFiles);
      
      const convertedFiles = fetchedFiles.map(convertDHIS2FileToFileItem);
      console.log('[DEBUG] refreshFiles - Converted FileItems:', convertedFiles);
      
      // Dedupe by id to avoid duplicate React keys
      const unique = Array.from(new Map(convertedFiles.map(f => [f.id, f])).values());
      console.log('[DEBUG] refreshFiles - Final unique files:', unique);
      
      setFiles(unique);
    } catch (error) {
      setErrorFiles(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  const saveFile = useCallback(async (file: FileItem): Promise<boolean> => {
    try {
      // Preserve existing stored fields like content/url/checksum/uploadStatus
      const existing = await dataStoreAPI.getFile(file.id);

      const merged: DHIS2File = {
        id: file.id,
        name: file.name,
        type: (file.type as any) || (existing?.type as any) || 'file',
        fileType: file.fileType ?? existing?.fileType,
        mimeType: file.mimeType ?? existing?.mimeType,
        size: file.size ?? existing?.size,
        sizeFormatted: file.sizeFormatted ?? existing?.sizeFormatted,
        // Always update modified timestamp on metadata save
        modified: new Date().toISOString(),
        created: file.created ?? existing?.created ?? new Date().toISOString(),
        owner: file.owner ?? existing?.owner ?? '',
        starred: file.starred ?? existing?.starred ?? false,
        shared: file.shared ?? existing?.shared ?? false,
        thumbnail: file.thumbnail ?? existing?.thumbnail,
        tags: file.tags ?? existing?.tags ?? [],
        language: file.language ?? existing?.language,
        documentType: file.documentType ?? existing?.documentType,
        description: file.description ?? existing?.description,
        version: file.version ?? existing?.version,
        parentId: file.parentId ?? existing?.parentId,
        path: file.path ?? existing?.path ?? `/${file.name}`,
        // Preserve content/url/checksum to keep previews working
        content: existing?.content,
        url: existing?.url,
        checksum: existing?.checksum,
        uploadStatus: existing?.uploadStatus ?? 'completed',
        uploadProgress: existing?.uploadProgress,
        trashed: file.trashed ?? existing?.trashed ?? false,
        deletedAt: file.deletedAt ?? existing?.deletedAt,
      };

      const success = await dataStoreAPI.saveFile(merged);
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
      // Fetch all folders from DHIS2 Data Store (not namespaces)
      const dhis2Folders = await dataStoreAPI.getAllFolders();
      console.log('[DEBUG] refreshFolders - Retrieved folders:', dhis2Folders);
      
      // Convert DHIS2Folder objects to FileItem objects and dedupe by id
      const convertedFolders = dhis2Folders.map((folder) => convertDHIS2FolderToFileItem(folder));
      const unique = Array.from(new Map(convertedFolders.map(f => [f.id, f])).values());
      console.log('[DEBUG] refreshFolders - Converted folders:', unique);
      setFolders(unique);
    } catch (error) {
      console.error('[DEBUG] refreshFolders - Error:', error);
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
        starred: folder.starred || false,
        shared: folder.shared || false,
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
      console.log('[DEBUG] createFolder - Creating folder:', { name, parentId });
      
      // Validate input
      if (!name || name.trim().length === 0) {
        throw new Error('Folder name cannot be empty');
      }
      
      // Check if folder with same name already exists in the same parent
      const existingFolder = folders.find(f => 
        f.name === name.trim() && f.parentId === parentId
      );
      
      if (existingFolder) {
        throw new Error(`A folder with the name "${name}" already exists in this location`);
      }
      
      const createdFolder = await dataStoreAPI.createFolder(name.trim(), parentId);
      console.log('[DEBUG] createFolder - Folder created in API:', createdFolder);
      
      if (!createdFolder) {
        throw new Error('Failed to create folder - API returned null');
      }
      
      // Verify the folder was actually saved by checking the API
      const verificationKey = `folder_${createdFolder.id}`;
      console.log('[DEBUG] createFolder - Verifying folder with key:', verificationKey);
      
      // Wait a moment for the API to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedFolder = await dataStoreAPI.getFolder(createdFolder.id);
      console.log('[DEBUG] createFolder - Verification result:', savedFolder);
      
      if (!savedFolder) {
        console.error('[DEBUG] createFolder - Folder not found after creation!');
        // Don't throw here, but log the issue for debugging
        // The folder might still be created but not immediately retrievable
      }
      
      const convertedFolder = convertDHIS2FolderToFileItem(createdFolder);
      console.log('[DEBUG] createFolder - Converted to FileItem:', convertedFolder);
      
      await refreshFolders();
      return convertedFolder;
      
    } catch (error) {
      console.error('[DEBUG] Error in createFolder:', error);
      return null;
    }
  }, [folders, refreshFolders]);

  const deleteFolder = useCallback(async (folderId: string): Promise<boolean> => {
    try {
      const ok = await dataStoreAPI.deleteFolder(folderId);
      if (ok) await refreshFolders();
      return ok;
    } catch (e) {
      console.error('Error deleting folder:', e);
      return false;
    }
  }, [refreshFolders]);

  const moveToTrash = useCallback(async (item: FileItem): Promise<boolean> => {
    try {
      if (item.type === 'file') {
        // Read full stored record then persist with trashed flag
        const existing = await dataStoreAPI.getFile(item.id);
        const updated = {
          ...(existing || {}),
          id: item.id,
          name: item.name,
          type: 'file',
          trashed: true,
          deletedAt: new Date().toISOString(),
          modified: new Date().toISOString(),
        } as any;
        const ok = await dataStoreAPI.saveFile(updated);
        if (ok) await refreshFiles();
        return ok;
      } else {
        const existing = await dataStoreAPI.getFolder(item.id as string);
        const updated = {
          ...(existing || {}),
          id: item.id,
          name: item.name,
          type: 'folder',
          trashed: true,
          deletedAt: new Date().toISOString(),
          modified: new Date().toISOString(),
        } as any;
        const ok = await dataStoreAPI.saveFolder(updated as any);
        if (ok) await refreshFolders();
        return ok;
      }
    } catch (e) {
      console.error('moveToTrash failed', e);
      return false;
    }
  }, [refreshFiles, refreshFolders]);

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
    moveToTrash,

    // Folders
    folders,
    loadingFolders,
    errorFolders,
    saveFolder,
    createFolder,
    deleteFolder: deleteFolder, // This was not in the new_code, so keep it as is
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
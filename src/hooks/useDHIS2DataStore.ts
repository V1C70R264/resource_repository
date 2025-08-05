import { useState, useEffect, useCallback } from 'react';
import { dataStoreAPI, DHIS2DataStoreAPI } from '@/lib/dhis2-api';
import { FileItem } from '@/lib/types';
import { AuditLog, User, Permission } from '@/lib/types';

interface UseDHIS2DataStoreReturn {
  // Files
  files: FileItem[];
  loadingFiles: boolean;
  errorFiles: string | null;
  saveFile: (file: FileItem) => Promise<boolean>;
  deleteFile: (fileId: string) => Promise<boolean>;
  refreshFiles: () => Promise<void>;

  // Folders
  folders: FileItem[];
  loadingFolders: boolean;
  errorFolders: string | null;
  saveFolder: (folder: FileItem) => Promise<boolean>;
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

  // General
  api: DHIS2DataStoreAPI;
  isLoading: boolean;
  hasError: boolean;
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

  // File operations
  const refreshFiles = useCallback(async () => {
    setLoadingFiles(true);
    setErrorFiles(null);
    try {
      const fetchedFiles = await dataStoreAPI.getAllFiles();
      setFiles(fetchedFiles);
    } catch (error) {
      setErrorFiles(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  const saveFile = useCallback(async (file: FileItem): Promise<boolean> => {
    try {
      const success = await dataStoreAPI.saveFile(file);
      if (success) {
        await refreshFiles();
      }
      return success;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
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
      setFolders(fetchedFolders);
    } catch (error) {
      setErrorFolders(error instanceof Error ? error.message : 'Failed to load folders');
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const saveFolder = useCallback(async (folder: FileItem): Promise<boolean> => {
    try {
      const success = await dataStoreAPI.saveFolder(folder);
      if (success) {
        await refreshFolders();
      }
      return success;
    } catch (error) {
      console.error('Error saving folder:', error);
      return false;
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

  // Load initial data
  useEffect(() => {
    refreshFiles();
    refreshFolders();
    refreshUsers();
    refreshAuditLogs();
    refreshPermissions();
    refreshSettings();
  }, [refreshFiles, refreshFolders, refreshUsers, refreshAuditLogs, refreshPermissions, refreshSettings]);

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
    refreshFiles,

    // Folders
    folders,
    loadingFolders,
    errorFolders,
    saveFolder,
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

    // General
    api: dataStoreAPI,
    isLoading,
    hasError,
  };
}; 
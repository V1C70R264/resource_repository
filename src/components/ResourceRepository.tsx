import { useState, useEffect, useRef } from "react";
import { Upload, Clock, Shield, Tag } from "lucide-react";
import { NoticeBox, Button, CircularLoader, Modal } from '@dhis2/ui'
import { IconUpload24, IconFolder24, IconChevronRight16, IconHome24 } from '@dhis2/ui-icons'
import { DHIS2Card } from "@/components/ui/dhis2-components";
import { Sidebar } from "./Sidebar";
import { FileGrid } from "./FileGrid";
import { NewFolderDialog } from "./NewFolderDialog";
import { FileUploadDialog } from "./FileUploadDialog";
import { FolderUploadDialog } from "./FolderUploadDialog";
import { AdvancedSearch } from "./AdvancedSearch";
import { AuditLogDialog } from "./AuditLog";
import { AccessControlDialog } from "./AccessControl";
import { FilePreview } from "./FilePreview";
import { MetadataEditor } from "./MetadataEditor";
import { APIStatus } from "./APIStatus";
// import { DebugPanel } from "./DebugPanel";
// import { TestPanel } from "./TestPanel";
import { useDHIS2Alerts } from "./DHIS2Alerts";
import { useDHIS2DataStore } from "@/hooks/useDHIS2DataStore";
import { 
  FileMetadata, 
  AuditLog, 
  User, 
  Permission, 
  SearchFilters, 
  PreviewData 
} from "@/lib/types";
import { createDataStoreAPI, dataStoreAPI } from "@/lib/dhis2-api";
import { ShareDialog } from './ShareDialog';
import { DHIS2_CONFIG, getApiUrl, getAuthHeaders } from '@/config/dhis2';

export interface FileItem extends FileMetadata {
  parentId?: string;
}

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

// Sample data
const sampleFiles: FileItem[] = [
  {
    id: '1',
    name: 'Project Documentation',
    type: 'folder',
    fileType: 'folder',
    mimeType: 'application/x-directory',
    size: 0,
    sizeFormatted: '0 B',
    modified: 'Oct 25, 2024',
    created: 'Oct 20, 2024',
    owner: 'John Doe',
    starred: true,
    shared: false,
    tags: ['important', 'docs', 'project'],
    language: 'en',
    documentType: 'Document',
    description: 'Project documentation and specifications',
    version: '1.0',
    path: '/Project Documentation'
  },
  {
    id: '2',
    name: 'Design Assets',
    type: 'folder',
    fileType: 'folder',
    mimeType: 'application/x-directory',
    size: 0,
    sizeFormatted: '0 B',
    modified: 'Oct 24, 2024',
    created: 'Oct 19, 2024',
    owner: 'Jane Smith',
    starred: false,
    shared: true,
    tags: ['design', 'ui', 'assets'],
    language: 'en',
    documentType: 'Image',
    description: 'Design assets and UI components',
    version: '2.1',
    path: '/Design Assets'
  },
  {
    id: '3',
    name: 'Annual Report 2024.pdf',
    type: 'file',
    fileType: 'document',
    mimeType: 'application/pdf',
    size: 2516582,
    sizeFormatted: '2.4 MB',
    modified: 'Oct 23, 2024',
    created: 'Oct 18, 2024',
    owner: 'Mike Johnson',
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
    id: '4',
    name: 'Team Photo.jpg',
    type: 'file',
    fileType: 'image',
    mimeType: 'image/jpeg',
    size: 1887436,
    sizeFormatted: '1.8 MB',
    modified: 'Oct 22, 2024',
    created: 'Oct 17, 2024',
    owner: 'Sarah Wilson',
    starred: true,
    shared: false,
    tags: ['team', 'photos', 'event'],
    language: 'en',
    documentType: 'Image',
    description: 'Team photo from company event',
    version: '1.0',
    path: '/Team Photo.jpg'
  },
  {
    id: '5',
    name: 'Presentation Video.mp4',
    type: 'file',
    fileType: 'video',
    mimeType: 'video/mp4',
    size: 47394652,
    sizeFormatted: '45.2 MB',
    modified: 'Oct 21, 2024',
    created: 'Oct 16, 2024',
    owner: 'Alex Brown',
    starred: false,
    shared: true,
    tags: ['presentation', 'video', 'meeting'],
    language: 'en',
    documentType: 'Video',
    description: 'Quarterly presentation recording',
    version: '2.0',
    path: '/Presentation Video.mp4'
  },
  {
    id: '6',
    name: 'Meeting Recording.mp3',
    type: 'file',
    fileType: 'audio',
    mimeType: 'audio/mpeg',
    size: 13107200,
    sizeFormatted: '12.5 MB',
    modified: 'Oct 20, 2024',
    created: 'Oct 15, 2024',
    owner: 'Lisa Davis',
    starred: false,
    shared: false,
    tags: ['meeting', 'recording', 'audio'],
    language: 'en',
    documentType: 'Audio',
    description: 'Meeting recording from weekly team sync',
    version: '1.0',
    path: '/Meeting Recording.mp3'
  },
  {
    id: '7',
    name: 'Code Repository.zip',
    type: 'file',
    fileType: 'archive',
    mimeType: 'application/zip',
    size: 52428800,
    sizeFormatted: '50.0 MB',
    modified: 'Oct 19, 2024',
    created: 'Oct 14, 2024',
    owner: 'David Chen',
    starred: false,
    shared: true,
    tags: ['code', 'repository', 'backup'],
    language: 'en',
    documentType: 'Archive',
    description: 'Backup of source code repository',
    version: '3.2',
    path: '/Code Repository.zip'
  },
  {
    id: '8',
    name: 'Marketing Strategy.docx',
    type: 'file',
    fileType: 'document',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 2097152,
    sizeFormatted: '2.0 MB',
    modified: 'Oct 18, 2024',
    created: 'Oct 13, 2024',
    owner: 'Emma Wilson',
    starred: true,
    shared: true,
    tags: ['marketing', 'strategy', 'document'],
    language: 'en',
    documentType: 'Document',
    description: 'Q4 marketing strategy document',
    version: '2.1',
    path: '/Marketing Strategy.docx'
  }
];

export function ResourceRepository() {
  const alerts = useDHIS2Alerts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('my-drive');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'My Drive', path: '/' }
  ]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const [showFolderUploadDialog, setShowFolderUploadDialog] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Enhanced features state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    fileTypes: [],
    tags: [],
    dateRange: {},
    owners: [],
    starred: false,
    shared: false,
  });
  const [previewFile, setPreviewFile] = useState<PreviewData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showAccessControl, setShowAccessControl] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [busyCount, setBusyCount] = useState(0);
  const startBusy = () => setBusyCount((c) => c + 1);
  const endBusy = () => setBusyCount((c) => Math.max(0, c - 1));
  const withBusy = async <T,>(fn: () => Promise<T>): Promise<T> => {
    startBusy();
    try {
      return await fn();
    } finally {
      endBusy();
    }
  };

  // Add state for selected items and double-tap tracking
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const lastTapRef = useRef<{ [id: string]: number }>({});
  const [showCheckboxes, setShowCheckboxes] = useState<{ [id: string]: boolean }>({});
  // Double-tap handling: defer single action briefly to allow a second tap
  const tapTimeoutRef = useRef<number | null>(null);
  const tappedItemRef = useRef<string | null>(null);

  // Selection actions
  const clearSelection = () => {
    setSelectedItems([]);
    setShowCheckboxes({});
  };

  const addStarToSelected = async () => {
    await withBusy(async () => {
      let successCount = 0;
      for (const id of selectedItems) {
        const item = allFiles.find(f => f.id === id);
        if (!item) continue;
        const updated = { ...item, starred: true } as any;
        const ok = item.type === 'file' ? await saveFile(updated) : await saveFolder(updated);
        if (ok) successCount += 1;
      }
      if (successCount > 0) alerts.success(`Starred ${successCount} item${successCount > 1 ? 's' : ''}`);
    });
  };

  const removeStarFromSelected = async () => {
    await withBusy(async () => {
      let successCount = 0;
      for (const id of selectedItems) {
        const item = allFiles.find(f => f.id === id);
        if (!item) continue;
        const updated = { ...item, starred: false } as any;
        const ok = item.type === 'file' ? await saveFile(updated) : await saveFolder(updated);
        if (ok) successCount += 1;
      }
      if (successCount > 0) alerts.success(`Removed star from ${successCount} item${successCount > 1 ? 's' : ''}`);
    });
  };

  const downloadSelected = async () => {
    await withBusy(async () => {
      for (const id of selectedItems) {
        const item = allFiles.find(f => f.id === id);
        if (!item) continue;
        if (item.type === 'file') await handleFileDownload(item);
        else await handleFolderDownload(item);
      }
    });
  };

  const deleteSelected = async () => {
    await withBusy(async () => {
      let successCount = 0;
      for (const id of selectedItems) {
        const item = allFiles.find(f => f.id === id);
        if (!item) continue;
        const ok = await moveToTrash(item);
        if (ok) successCount += 1;
      }
      if (successCount > 0) alerts.warning(`Moved ${successCount} item${successCount > 1 ? 's' : ''} to trash`);
      clearSelection();
    });
  };

  // DHIS2 Data Store integration
  const {
    files: dhis2Files,
    folders: dhis2Folders,
    users: dhis2Users,
    auditLogs: dhis2AuditLogs,
    permissions: dhis2Permissions,
    settings: dhis2Settings,
    saveFile,
    saveFolder,
    createFolder,
    uploadFile,
    saveAuditLog,
    savePermissions,
    searchFiles: apiSearchFiles,
    refreshFolders,
    refreshFiles,
    refreshSettings,
    refreshPermissions,
    isLoading,
    hasError,
    initializeData,
    moveToTrash,
  } = useDHIS2DataStore();

  // Get current user id from config (or session)
  const [currentUser, setCurrentUser] = useState<{ id: string; groupIds: Set<string>; roleIds: Set<string>; orgUnitIds: Set<string> } | null>(null);
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const url = getApiUrl('/me.json?fields=id,userGroups[id],userRoles[id],organisationUnits[id]&paging=false');
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (res.ok) {
          const me = await res.json();
          const groupIds = new Set<string>((me.userGroups || []).map((g: any) => g.id));
          const roleIds = new Set<string>((me.userRoles || []).map((r: any) => r.id));
          const orgUnitIds = new Set<string>((me.organisationUnits || []).map((o: any) => o.id));
          setCurrentUser({ id: me.id, groupIds, roleIds, orgUnitIds });
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };
    fetchMe();
  }, []);

  // Remove verbose API test logs in production
  // (no-op)

  // Combine files and folders from DHIS2
  const allFiles = [...dhis2Files, ...dhis2Folders];

  // Removed verbose console logs

  // Filter files for shared section based on permissions for current user
  const sharedFileIds = dhis2Permissions
    .filter(p => {
      // ignore expired
      if (p.expiresAt && new Date(p.expiresAt) < new Date()) return false;
      // Allowed access types
      if (!(p.type === 'read' || p.type === 'write' || p.type === 'admin')) return false;
      // If /me not loaded, fallback to username matching legacy fields
      if (!currentUser) {
        const fallbackId = DHIS2_CONFIG.USERNAME;
        return p.userId === fallbackId || p.targetId === fallbackId;
      }
      // Direct user match (legacy or explicit)
      if (p.userId && p.userId === currentUser.id) return true;
      if ((p.targetType === undefined || p.targetType === 'user') && p.targetId === currentUser.id) return true;
      // Group/role/orgUnit membership
      if (p.targetType === 'group' && p.targetId && currentUser.groupIds.has(p.targetId)) return true;
      if (p.targetType === 'role' && p.targetId && currentUser.roleIds.has(p.targetId)) return true;
      if (p.targetType === 'orgUnit' && p.targetId && currentUser.orgUnitIds.has(p.targetId)) return true;
      return false;
    })
    .map(p => p.fileId);

  // When section changes via Sidebar, reset folder scope appropriately
  useEffect(() => {
    if (activeSection === 'my-drive') {
      // Stay in current folder if already inside; otherwise root
      // No special reset needed here
    } else {
      // For non-folder sections, ignore currentFolderId to show items from anywhere
      // Achieve by not relying on currentFolderId in filtering for these sections
    }
  }, [activeSection]);

  const filteredFiles = allFiles.filter(file => {
    const q = (searchFilters.query || '').trim().toLowerCase();
    const matchesQuery = q.length === 0 ||
      file.name.toLowerCase().includes(q) ||
      (file.description || '').toLowerCase().includes(q) ||
      (file.tags || []).some(tag => tag.toLowerCase().includes(q));

    const matchesFileTypes = (searchFilters.fileTypes?.length || 0) === 0 || (searchFilters.fileTypes || []).includes(file.fileType || '');
    const matchesTags = (searchFilters.tags?.length || 0) === 0 || (searchFilters.tags || []).some(tag => (file.tags || []).includes(tag));
    const matchesOwners = (searchFilters.owners?.length || 0) === 0 || (searchFilters.owners || []).includes(file.owner);
    const matchesStarred = !searchFilters.starred || file.starred === true;
    const matchesShared = !searchFilters.shared || file.shared === true;

    const startOk = !searchFilters.dateRange?.start || new Date(file.modified) >= new Date(searchFilters.dateRange.start);
    const endOk = !searchFilters.dateRange?.end || new Date(file.modified) <= new Date(searchFilters.dateRange.end);
    const matchesDate = startOk && endOk;

    // Folder scope only applies in My Drive; other sections span all folders
    const inCurrentFolder = activeSection === 'my-drive'
      ? (currentFolderId ? file.parentId === currentFolderId : !file.parentId)
      : true;

    const passesFilters = matchesQuery && matchesFileTypes && matchesTags && matchesOwners && matchesStarred && matchesShared && matchesDate;

    const nowTs = Date.now();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const isRecent = nowTs - new Date(file.modified).getTime() <= THIRTY_DAYS_MS;

    switch (activeSection) {
      case 'shared':
        // Only show files/folders shared to the current user
        return sharedFileIds.includes(file.id) && !file.trashed;
      case 'starred':
        return passesFilters && file.starred && !file.trashed;
      case 'recent':
        return passesFilters && !file.trashed && isRecent;
      case 'trash':
        return passesFilters && file.trashed === true;
      default:
        // My Drive: only items owned by current user (or by fallback username if /me not loaded)
        const ownerId = currentUser?.id || DHIS2_CONFIG.USERNAME;
        return passesFilters && inCurrentFolder && !file.trashed && file.owner === ownerId;
    }
  });
  
  // Debug info for UI
  const debugInfo = {
    totalFiles: dhis2Files.length,
    totalFolders: dhis2Folders.length,
    currentFolder: currentFolderId,
    activeSection,
    filteredCount: filteredFiles.length
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      setBreadcrumbs(prev => [...prev, { 
        id: item.id, 
        name: item.name, 
        path: `/${item.name}` 
      }]);
      alerts.info(`Opened folder: ${item.name}`);
    }
  };

  const handleItemAction = async (action: string, item: FileItem) => {
    switch (action) {
      case 'preview':
        if (item.type === 'file') {
          try {
            // Fetch full file record to get inline content or a stored URL
            const dhis2File = await dataStoreAPI.getFile(item.id);
            let previewUrl = '';

            if (dhis2File?.content) {
              const mime = dhis2File.mimeType || item.mimeType || 'application/octet-stream';
              previewUrl = `data:${mime};base64,${dhis2File.content}`;
            } else if (dhis2File?.url && /^https?:|^data:|^blob:/.test(dhis2File.url) === true) {
              previewUrl = dhis2File.url;
            } else {
              // As a last resort, try thumbnail for images
              if (item.thumbnail) {
                previewUrl = item.thumbnail;
              }
            }

            if (!previewUrl) {
              throw new Error('No previewable content found for this file');
            }

            const previewData: PreviewData = {
              fileId: item.id,
              fileName: item.name,
              fileType: item.fileType || 'unknown',
              mimeType: item.mimeType || 'application/octet-stream',
              url: previewUrl,
              thumbnail: item.thumbnail,
              canEdit: true,
            };
            setPreviewFile(previewData);
            setShowPreview(true);

            const auditLog: AuditLog = {
              id: `log_${Date.now()}`,
              fileId: item.id,
              fileName: item.name,
              action: 'view',
              userId: 'current-user',
              userName: 'Current User',
              timestamp: new Date().toISOString(),
              details: 'File previewed',
            };
            saveAuditLog(auditLog);
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to prepare preview';
            alerts.critical(message);
          }
        }
        break;
      case 'download':
        if (item.type === 'file') {
          await handleFileDownload(item);
        } else {
          await handleFolderDownload(item);
        }
        break;
      case 'share':
        setSelectedFile(item);
        setShowShare(true);
        break;
      case 'star':
        await withBusy(async () => {
          console.log('[DEBUG] Star action - Original item:', item);
          const updatedItem = { ...item, starred: !item.starred };
          console.log('[DEBUG] Star action - Updated item:', updatedItem);
          
          let ok: boolean;
          if (item.type === 'file') {
            console.log('[DEBUG] Star action - Saving file...');
            ok = await saveFile(updatedItem);
          } else {
            console.log('[DEBUG] Star action - Saving folder...');
            ok = await saveFolder(updatedItem);
          }
          
          console.log('[DEBUG] Star action - Save result:', ok);
          
          if (ok) {
            alerts.success(`${updatedItem.starred ? 'Starred' : 'Removed star from'}: ${item.name}`);
          } else {
            alerts.critical(`Failed to ${item.starred ? 'remove star from' : 'star'}: ${item.name}`);
          }
        });
        break;
      case 'delete':
        // Show confirmation modal instead of immediate delete
        setDeleteTarget(item);
        setShowDeleteConfirm(true);
        break;
      case 'metadata':
        setSelectedFile(item);
        setShowMetadataEditor(true);
        break;
      case 'permissions':
        setSelectedFile(item);
        setShowAccessControl(true);
        break;
      case 'audit':
        setSelectedFile(item);
        setShowAuditLog(true);
        break;
      default:
        alerts.info(`Action ${action} on: ${item.name}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await withBusy(async () => {
      const ok = await moveToTrash(deleteTarget);
      if (ok) {
        alerts.warning(`Moved to trash: ${deleteTarget.name}`);
        const auditLog: AuditLog = {
          id: `log_${Date.now()}`,
          fileId: deleteTarget.id,
          fileName: deleteTarget.name,
          action: 'delete',
          userId: 'current-user',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
          details: 'Item moved to trash',
        };
        saveAuditLog(auditLog);
      } else {
        alerts.critical(`Failed to move to trash: ${deleteTarget.name}`);
      }
    });
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handleBreadcrumbNavigate = (path: string) => {
    const clickedIndex = breadcrumbs.findIndex(item => item.path === path);
    if (clickedIndex >= 0) {
      const newBreadcrumbs = breadcrumbs.slice(0, clickedIndex + 1);
      setBreadcrumbs(newBreadcrumbs);
      
      if (clickedIndex === 0) {
        setCurrentFolderId(null);
      } else {
        setCurrentFolderId(newBreadcrumbs[clickedIndex].id);
      }
      
      alerts.info(`Navigated to: ${newBreadcrumbs[clickedIndex].name}`);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      console.log('[DEBUG] handleCreateFolder called with:', name);
      
      // Show loading state
      alerts.info(`Creating folder "${name}"...`);
      
      // Use the correct method - createFolder instead of createNamespace
      const success = await withBusy(() => createFolder(name, currentFolderId));
      console.log('[DEBUG] createFolder result:', success);
      
      if (success) {
        alerts.success(`Folder "${name}" created successfully`);
        // No need to call initializeData() - createFolder already refreshes
      } else {
        alerts.critical('Failed to create folder');
      }
    } catch (error) {
      console.error('[DEBUG] Error in handleCreateFolder:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to create folder';
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          errorMessage = error.message;
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network error - please check your connection';
        } else if (error.message.includes('Authentication error')) {
          errorMessage = 'Authentication error - please check your credentials';
        } else if (error.message.includes('Server error')) {
          errorMessage = 'Server error - please try again later';
        } else if (error.message.includes('cannot be empty')) {
          errorMessage = 'Folder name cannot be empty';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      alerts.critical(errorMessage);
    }
  };

  const handleNewFolderClick = () => {
    setShowNewFolderDialog(true);
  };

  const handleFileUploadClick = () => {
    setShowFileUploadDialog(true);
  };

  const handleFolderUploadClick = () => {
    setShowFolderUploadDialog(true);
  };

  const handleGoToMyDrive = () => {
    setActiveSection('my-drive');
    setCurrentFolderId(null);
    setBreadcrumbs([{ id: 'root', name: 'My Drive', path: '/' }]);
  };

  const handleFileUploadComplete = async (uploadedFiles: any[], folderId?: string) => {
    try {
      console.log('[DEBUG] handleFileUploadComplete - Received uploaded files:', uploadedFiles);
      
      // The files are already uploaded via the FileUploadDialog, so we just need to refresh
      // and show success message
      await withBusy(() => refreshFiles());
      
      if (uploadedFiles.length > 0) {
        alerts.success(`Successfully uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error handling file upload completion:', error);
      alerts.critical('Failed to refresh file list after upload');
    }
  };

  const handleFolderUploadComplete = async (result: { createdFolders: any[]; uploadedFiles: any[] }, folderId?: string) => {
    try {
      // Refresh data from DHIS2 after folder upload
      await withBusy(() => Promise.all([refreshFolders(), refreshFiles()]));
      const folderCount = result.createdFolders?.length || 0;
      const fileCount = result.uploadedFiles?.length || 0;
      alerts.success(`Uploaded ${folderCount} folder${folderCount !== 1 ? 's' : ''} with ${fileCount} file${fileCount !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error handling folder upload completion:', error);
      alerts.critical('Failed to refresh after folder upload');
    }
  };

  const handleMainAreaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleMainAreaDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleMainAreaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Open the file upload dialog with the dropped files
      setShowFileUploadDialog(true);
      // Note: The FileUploadDialog will handle the actual upload
    }
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return 'file';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) return 'audio';
    if (['zip', 'rar', '7z', 'tar'].includes(extension)) return 'archive';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheet';
    if (['ppt', 'pptx'].includes(extension)) return 'presentation';
    
    return 'file';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCurrentFolderName = (): string => {
    return breadcrumbs[breadcrumbs.length - 1]?.name || 'My Drive';
  };

  // Enhanced feature handlers
  const handleSearchFiltersChange = async (filters: SearchFilters) => {
    setSearchFilters(filters);
    
    // Use API search if query is provided
    if (filters.query.trim()) {
      try {
        const searchResults = await apiSearchFiles(filters.query, filters);
        // Update the filtered files with search results
        // Note: This is a simplified approach - in a real app you might want to merge with local filtering
        console.log('Search results:', searchResults);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  const handleMetadataSave = (metadata: FileMetadata) => {
    if (metadata.type === 'file') {
      saveFile(metadata as any);
    } else {
      saveFolder(metadata as any);
    }
    alerts.success('Metadata updated successfully');
    setShowMetadataEditor(false);
  };

  const handlePermissionChange = (permission: Permission, action: 'add' | 'update' | 'remove') => {
    let updated: Permission[] = [];
    switch (action) {
      case 'add':
        updated = [...dhis2Permissions, permission];
        break;
      case 'update':
        updated = dhis2Permissions.map(p => p.id === permission.id ? permission : p);
        break;
      case 'remove':
        updated = dhis2Permissions.filter(p => p.id !== permission.id);
        break;
    }
    savePermissions(updated);
    alerts.success(`Permission ${action}ed successfully`);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  const handlePreviewDownload = () => {
    alerts.info('Download started');
  };

  const handlePreviewShare = () => {
    alerts.info('Share dialog opened');
  };

  const handlePreviewEdit = () => {
    alerts.info('Edit mode activated');
  };

  const [showShare, setShowShare] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null);

  const handleShareConfirm = async (perms: Permission[]) => {
    try {
      // Merge existing + new, avoiding duplicates on same (fileId,targetType,targetId)
      const dedupKey = (p: Permission) => `${p.fileId}|${p.targetType || 'user'}|${p.targetId}`;
      const existingMap = new Map(dhis2Permissions.map(p => [dedupKey(p), p]));
      for (const p of perms) {
        existingMap.set(dedupKey(p), p);
      }
      const updated = Array.from(existingMap.values());
      const ok = await savePermissions(updated);
      if (!ok) throw new Error('Failed to save permissions');
      const log: AuditLog = {
        id: `log_${Date.now()}`,
        fileId: perms[0]?.fileId || selectedFile?.id || '',
        fileName: selectedFile?.name || `${perms.length} items`,
        action: 'share',
        userId: 'current-user',
        userName: 'Current User',
        timestamp: new Date().toISOString(),
        details: `Shared ${new Set(perms.map(p => p.fileId)).size} item(s) with ${perms.length} permission entry(ies)`
      };
      await saveAuditLog(log);
      alerts.success('Shared successfully');
    } catch (e) {
      alerts.critical('Failed to share');
    } finally {
      setShowShare(false);
      setSelectedFile(null);
    }
  };

  // Get available data for filters
  const availableTags = Array.from(new Set(allFiles.flatMap(f => f.tags || []))) as string[];
  const availableFileTypes = Array.from(new Set(allFiles.map(f => f.fileType).filter(Boolean))) as string[];
  const availableOwners = Array.from(new Set(allFiles.map(f => f.owner))) as string[];

  const defaultSearchFilters: SearchFilters = {
    query: '',
    fileTypes: [],
    tags: [],
    dateRange: {},
    owners: [],
    starred: false,
    shared: false,
  };

  // Clear filters on section change and reset folder scope for My Drive
  useEffect(() => {
    setSearchFilters(defaultSearchFilters);
    if (activeSection === 'my-drive') {
      setCurrentFolderId(null);
    }
  }, [activeSection]);

  const triggerBrowserDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const base64ToBlob = (base64Data: string, contentType: string): Blob => {
    const byteCharacters = atob(base64Data);
    const byteArrays: Uint8Array[] = [];
    const sliceSize = 1024;
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  };

  const handleFileDownload = async (item: FileItem) => {
    await withBusy(async () => {
      try {
        const rec = await dataStoreAPI.getFile(item.id);
        const filename = item.name;
        const mime = item.mimeType || rec?.mimeType || 'application/octet-stream';
        if (rec?.content) {
          const blob = base64ToBlob(rec.content, mime);
          triggerBrowserDownload(blob, filename);
        } else if (rec?.url && /^(https?:|data:|blob:)/i.test(rec.url)) {
          try {
            const headers = getAuthHeaders();
            delete (headers as any)['Content-Type'];
            const resp = await fetch(rec.url, { headers });
            const blob = await resp.blob();
            triggerBrowserDownload(blob, filename);
          } catch {
            const a = document.createElement('a');
            a.href = rec.url;
            a.target = '_blank';
            a.rel = 'noopener';
            document.body.appendChild(a);
            a.click();
            a.remove();
          }
        } else {
          alerts.critical('No downloadable content found for this file');
          return;
        }
        const log: AuditLog = {
          id: `log_${Date.now()}`,
          fileId: item.id,
          fileName: item.name,
          action: 'download',
          userId: 'current-user',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
          details: 'File downloaded',
        };
        saveAuditLog(log);
      } catch (e) {
        alerts.critical('Failed to download file');
      }
    });
  };

  const collectDescendantFiles = (folderId: string): FileItem[] => {
    const idToChildren = new Map<string, FileItem[]>();
    for (const itm of allFiles) {
      if (itm.parentId) {
        const arr = idToChildren.get(itm.parentId) || [];
        arr.push(itm);
        idToChildren.set(itm.parentId, arr);
      }
    }
    const result: FileItem[] = [];
    const stack: string[] = [folderId];
    while (stack.length) {
      const id = stack.pop()!;
      const children = idToChildren.get(id) || [];
      for (const ch of children) {
        if (ch.type === 'file') {
          result.push(ch);
        } else if (ch.type === 'folder') {
          stack.push(ch.id);
        }
      }
    }
    return result;
  };

  // Build folder child counts (direct children only, excluding trashed)
  const folderChildCounts: Record<string, number> = (() => {
    const counts: Record<string, number> = {};
    for (const item of allFiles) {
      if (item.trashed) continue;
      if (item.parentId) {
        counts[item.parentId] = (counts[item.parentId] || 0) + 1;
      }
    }
    return counts;
  })();

  const handleFolderDownload = async (folder: FileItem) => {
    const files = collectDescendantFiles(folder.id);
    if (files.length === 0) {
      alerts.info('This folder has no files to download');
      return;
    }
    alerts.info(`Starting download of ${files.length} file(s) from "${folder.name}"`);
    // Download sequentially to avoid overwhelming browser
    for (const f of files) {
      await handleFileDownload(f);
    }
    alerts.success(`Completed downloads from "${folder.name}"`);
  };

  const now = Date.now();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const counts = {
    myDrive: allFiles.filter(f => !f.trashed && (f.parentId ? false : true)).length,
    shared: allFiles.filter(f => f.shared && !f.trashed).length,
    recent: allFiles.filter(f => !f.trashed && (now - new Date(f.modified).getTime() <= THIRTY_DAYS_MS)).length,
    starred: allFiles.filter(f => f.starred && !f.trashed).length,
    trash: allFiles.filter(f => f.trashed).length,
  };

  // Handler for item tap (single/double)
  const handleItemTap = (item: FileItem) => {
    const thresholdMs = 300;

    // If second tap on same item within threshold → enter multi-select mode
    if (tapTimeoutRef.current !== null && tappedItemRef.current === item.id) {
      window.clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
      tappedItemRef.current = null;

      const allVisible: { [id: string]: boolean } = {};
      for (const it of filteredFiles) allVisible[it.id] = true;
      setShowCheckboxes(allVisible);
      setSelectedItems(prev => (prev.includes(item.id) ? prev : [...prev, item.id]));
      return;
    }

    // Schedule single-tap behavior
    tappedItemRef.current = item.id;
    tapTimeoutRef.current = window.setTimeout(() => {
      tapTimeoutRef.current = null;
      tappedItemRef.current = null;

      const inSelectionMode = Object.keys(showCheckboxes || {}).length > 0;
      if (inSelectionMode) {
        // Toggle selection only, do not open
        setShowCheckboxes(prev => ({ ...prev, [item.id]: true }));
        setSelectedItems(prev => {
          const isSelected = prev.includes(item.id);
          const next = isSelected ? prev.filter(id => id !== item.id) : [...prev, item.id];
          if (next.length === 0) setShowCheckboxes({});
          return next;
        });
      } else {
        // Normal single-click open
        if (item.type === 'file') {
          handleItemAction('preview', item);
        } else {
          handleItemClick(item);
        }
      }
    }, thresholdMs);
  };

  // Handler for checkbox change
  const handleSelectChange = (item: FileItem, checked: boolean) => {
    setSelectedItems(prev => {
      let next;
      if (checked) {
        next = [...prev, item.id];
      } else {
        next = prev.filter(id => id !== item.id);
      }
      // If only one item was selected and now none, clear all checkboxes
      if (next.length === 0) {
        setShowCheckboxes({});
      }
      return next;
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
              {/* <Header />
         */}
                 {/* Enhanced Search Bar */}
         <div className="px-6 py-3 border-b bg-muted/30">
           <AdvancedSearch
             filters={searchFilters}
             onFiltersChange={handleSearchFiltersChange}
             availableTags={availableTags}
             availableFileTypes={availableFileTypes}
             availableOwners={availableOwners}
             viewMode={viewMode}
             onViewModeChange={setViewMode}
           />
         </div>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onNewFolderClick={handleNewFolderClick}
          onFileUploadClick={handleFileUploadClick}
          onFolderUploadClick={handleFolderUploadClick}
          counts={{
            myDrive: allFiles.filter(f => !f.trashed && (!f.parentId || f.parentId === 'root')).length,
            shared: sharedFileIds.length,
            recent: allFiles.filter(f => !f.trashed && (Date.now() - new Date(f.modified).getTime() <= 30 * 24 * 60 * 60 * 1000)).length,
            starred: allFiles.filter(f => f.starred && !f.trashed).length,
            trash: allFiles.filter(f => f.trashed).length,
          }}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-1 text-sm">
              {/* Home icon button */}
              <Button small secondary onClick={() => handleBreadcrumbNavigate('/')}> 
                <span className="inline-flex items-center"><IconHome24 /></span>
              </Button>
              {activeSection === 'my-drive'
                ? (
                  <>
                    {breadcrumbs.map((bc, index) => (
                      <div key={bc.id} className="flex items-center gap-1">
                        <span className="text-muted-foreground"><IconChevronRight16 /></span>
                        <Button
                          small
                          secondary
                          disabled={index === breadcrumbs.length - 1}
                          onClick={index === breadcrumbs.length - 1 ? undefined : () => handleBreadcrumbNavigate(bc.path)}
                        >
                          {bc.name}
                        </Button>
                      </div>
                    ))}
                  </>
                )
                : (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground"><IconChevronRight16 /></span>
                      <Button small secondary disabled>
                        {activeSection === 'shared' && 'Shared'}
                        {activeSection === 'recent' && 'Recent'}
                        {activeSection === 'starred' && 'Starred'}
                        {activeSection === 'trash' && 'Trash'}
                      </Button>
                    </div>
                  </>
                )}
            </div>
          </div>
          
          <div 
            className={`flex-1 p-6 overflow-auto transition-colors ${
              isDragOver ? 'bg-drive-blue/5 border-2 border-dashed border-drive-blue' : ''
            }`}
            onDragOver={handleMainAreaDragOver}
            onDragLeave={handleMainAreaDragLeave}
            onDrop={handleMainAreaDrop}
          >
            {selectedItems.length > 0 && (
              <div className="sticky top-2 z-40 mb-4 flex justify-center">
                <div className="inline-flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 py-2 rounded border shadow-sm">
                  <span className="text-sm mr-2">{selectedItems.length} selected</span>
                  <Button small onClick={addStarToSelected}>Add star</Button>
                  <Button small onClick={removeStarFromSelected}>Remove star</Button>
                  <Button small onClick={downloadSelected}>Download</Button>
                  <Button small destructive onClick={deleteSelected}>Delete</Button>
                  <Button small secondary onClick={clearSelection}>Clear</Button>
                </div>
              </div>
            )}
            {(busyCount > 0 || isLoading) && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/10" aria-busy="true">
                <CircularLoader />
              </div>
            )}
            <div className="mb-6">
              {isDragOver && (
                <div className="fixed inset-0 bg-drive-blue/10 backdrop-blur-sm z-50 flex items-center justify-center">
                  <DHIS2Card className="border-2 border-dashed border-drive-blue p-8 text-center w-96 h-64">
                    <Upload className="w-16 h-16 text-drive-blue mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Drop files here</h3>
                    <p className="text-muted-foreground">
                      Upload files to {getCurrentFolderName()}
                    </p>
                  </DHIS2Card>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    {activeSection === 'my-drive' && 'My Drive'}
                    {activeSection === 'shared' && 'Shared Items'}
                    {activeSection === 'recent' && 'Recent'}
                    {activeSection === 'starred' && 'Starred'}
                    {activeSection === 'trash' && 'Trash'}
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredFiles.length} {filteredFiles.length === 1 ? 'item' : 'items'}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </p>
                </div>
                
                {/* Debug buttons (removed) */}
                {/* <div className="flex gap-2">
                  <button
                    onClick={() => withBusy(() => refreshFolders())}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Refresh Folders
                  </button>
                  <button
                    onClick={() => console.log('Current folders:', dhis2Folders)}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Log Folders
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const keys = await dataStoreAPI.getNamespaceKeys();
                        console.log('API Namespace Keys:', keys);
                        const folders = await dataStoreAPI.getAllFolders();
                        console.log('API All Folders:', folders);
                      } catch (error) {
                        console.error('API Check Error:', error);
                      }
                    }}
                    className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Check API
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Initializing required keys...');
                        await withBusy(() => dataStoreAPI.manualInitialize());
                        console.log('Required keys initialized successfully');
                        alerts.success('Required keys initialized successfully');
                        // Refresh the data after initialization
                        await withBusy(async () => {
                          await refreshFolders();
                          await refreshFiles();
                          await refreshSettings();
                          await refreshPermissions();
                        });
                      } catch (error) {
                        console.error('Failed to initialize required keys:', error);
                        alerts.critical('Failed to initialize required keys');
                      }
                    }}
                    className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    Init Keys
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Checking current key status...');
                        const settings = await dataStoreAPI.getSettings();
                        const permissions = await dataStoreAPI.getPermissions();
                        console.log('Current settings:', settings);
                        console.log('Current permissions:', permissions);
                         alerts.success(`Settings: ${Object.keys(settings).length} keys, Permissions: ${permissions.length} items`);
                      } catch (error) {
                        console.error('Failed to check key status:', error);
                        alerts.critical('Failed to check key status');
                      }
                    }}
                    className="px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600"
                  >
                    Check Keys
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Checking detailed key status...');
                        const keysWithStatus = await dataStoreAPI.getNamespaceKeysWithStatus();
                        console.log('Keys with status:', keysWithStatus);
                        const existingKeys = keysWithStatus.filter(k => k.exists).map(k => k.key);
                        const missingKeys = keysWithStatus.filter(k => !k.exists).map(k => k.key);
                         alerts.success(`Existing: ${existingKeys.join(', ') || 'none'}, Missing: ${missingKeys.join(', ') || 'none'}`);
                      } catch (error) {
                        console.error('Failed to check detailed key status:', error);
                        alerts.critical('Failed to check detailed key status');
                      }
                    }}
                    className="px-3 py-1 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600"
                  >
                    Key Status
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Testing connectivity...');
                        const result = await dataStoreAPI.testConnectivity();
                        console.log('Connectivity test result:', result);
                         alerts.success(`API: ${result.apiAccessible ? 'OK' : 'FAIL'}, Namespace: ${result.namespaceAccessible ? 'OK' : 'FAIL'}, Keys: ${result.keysCount}`);
                      } catch (error) {
                        console.error('Failed to test connectivity:', error);
                        alerts.critical('Failed to test connectivity');
                      }
                    }}
                    className="px-3 py-1 text-sm bg-pink-500 text-white rounded hover:bg-pink-600"
                  >
                    Test API
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Testing simple API request...');
                        const response = await fetch('https://play.dhis2.udsm.ac.tz/api/system/info', {
                          method: 'GET',
                          headers: {
                            'Authorization': 'Basic ' + btoa('student:Dhis2@2025'),
                            'Content-Type': 'application/json',
                          },
                        });
                        console.log('Simple API response:', response);
                        if (response.ok) {
                          const data = await response.json();
                          console.log('Simple API data:', data);
                         alerts.success('Simple API test successful');
                        } else {
                           alerts.critical(`Simple API test failed: ${response.status}`);
                        }
                      } catch (error) {
                        console.error('Simple API test failed:', error);
                         alerts.critical('Simple API test failed');
                      }
                    }}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Simple Test
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Testing data store endpoint...');
                        const response = await fetch('https://play.dhis2.udsm.ac.tz/api/dataStore/resource-repository', {
                          method: 'GET',
                          headers: {
                            'Authorization': 'Basic ' + btoa('student:Dhis2@2025'),
                            'Content-Type': 'application/json',
                          },
                        });
                        console.log('Data store response:', response);
                        if (response.ok) {
                          const data = await response.json();
                          console.log('Data store data:', data);
                           alerts.success('Data store test successful');
                        } else {
                          const errorText = await response.text().catch(() => 'Unable to read error');
                          console.log('Data store error text:', errorText);
                           alerts.critical(`Data store test failed: ${response.status} - ${errorText}`);
                        }
                      } catch (error) {
                        console.error('Data store test failed:', error);
                         alerts.critical('Data store test failed');
                      }
                    }}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Data Store Test
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Testing data store key creation...');
                        const testData = { test: true, timestamp: new Date().toISOString() };
                        const response = await fetch('https://play.dhis2.udsm.ac.tz/api/dataStore/resource-repository/test-key', {
                          method: 'POST',
                          headers: {
                            'Authorization': 'Basic ' + btoa('student:Dhis2@2025'),
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(testData),
                        });
                        console.log('Key creation response:', response);
                        if (response.ok) {
                           alerts.success('Key creation test successful');
                          // Clean up the test key
                          await fetch('https://play.dhis2.udsm.ac.tz/api/dataStore/resource-repository/test-key', {
                            method: 'DELETE',
                            headers: {
                              'Authorization': 'Basic ' + btoa('student:Dhis2@2025'),
                            },
                          });
                        } else {
                          const errorText = await response.text().catch(() => 'Unable to read error');
                          console.log('Key creation error text:', errorText);
                           alerts.critical(`Key creation test failed: ${response.status} - ${errorText}`);
                        }
                      } catch (error) {
                        console.error('Key creation test failed:', error);
                         alerts.critical('Key creation test failed');
                      }
                    }}
                    className="px-3 py-1 text-sm bg-lime-500 text-white rounded hover:bg-lime-600"
                  >
                    Create Key Test
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Testing settings endpoint...');
                        const response = await fetch('https://play.dhis2.udsm.ac.tz/api/dataStore/resource-repository/settings', {
                          method: 'GET',
                          headers: {
                            'Authorization': 'Basic ' + btoa('student:Dhis2@2025'),
                            'Content-Type': 'application/json',
                          },
                        });
                        console.log('Settings response:', response);
                        if (response.ok) {
                          const data = await response.json();
                          console.log('Settings data:', data);
                           alerts.success('Settings test successful');
                        } else {
                          const errorText = await response.text().catch(() => 'Unable to read error');
                          console.log('Settings error text:', errorText);
                           alerts.critical(`Settings test failed: ${response.status} - ${errorText}`);
                        }
                      } catch (error) {
                        console.error('Settings test failed:', error);
                         alerts.critical('Settings test failed');
                      }
                    }}
                    className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Settings Test
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Refreshing all data...');
                        await withBusy(async () => {
                          await refreshFolders();
                          await refreshFiles();
                          await refreshSettings();
                          await refreshPermissions();
                        });
                         alerts.success('All data refreshed successfully');
                      } catch (error) {
                        console.error('Failed to refresh data:', error);
                         alerts.critical('Failed to refresh data');
                      }
                    }}
                    className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
                  >
                    Refresh All
                  </button>
                </div> */}
                
                {/* Debug info display removed */}
              </div>
            </div>
            
            {filteredFiles.length === 0 ? (
              <div className="py-12 max-w-2xl mx-auto">
                <NoticeBox title={
                  activeSection === 'trash'
                    ? 'Trash is empty'
                    : searchQuery
                      ? 'No results found'
                      : activeSection === 'starred'
                        ? 'No starred items'
                        : activeSection === 'shared'
                          ? 'No shared items'
                          : activeSection === 'recent'
                            ? 'No recent items'
                            : activeSection === 'my-drive'
                              ? (currentFolderId ? 'Folder is empty' : 'My Drive is empty')
                              : 'Folder is empty'
                }>
                  <div className="space-y-3">
                    <p>
                      {activeSection === 'trash'
                        ? 'Deleted items will appear here. You cannot upload to Trash.'
                        : searchQuery
                          ? `No results for "${searchQuery}".`
                          : activeSection === 'starred'
                            ? 'Mark items as starred to surface them here for quick access.'
                            : activeSection === 'shared'
                              ? 'Items shared with you will appear here.'
                              : activeSection === 'recent'
                                ? 'Your recently opened items will appear here.'
                                : 'Get started by uploading files, uploading a folder, or creating a new folder.'}
                    </p>
                    {activeSection === 'trash' ? (
                      <div className="flex flex-wrap gap-8 items-center">
                        <Button secondary onClick={handleGoToMyDrive}>
                          <span className="inline-flex items-center gap-2">
                            <IconFolder24 />
                            Go to My Drive
                          </span>
                        </Button>
                      </div>
                    ) : (
                      !searchQuery && activeSection === 'my-drive' && (
                        <div className="flex flex-wrap gap-8 items-center">
                          <Button primary onClick={handleFileUploadClick}>
                            <span className="inline-flex items-center gap-2">
                              <IconUpload24 />
                              Upload files
                            </span>
                          </Button>
                          <Button secondary onClick={handleFolderUploadClick}>
                            <span className="inline-flex items-center gap-2">
                              <IconFolder24 />
                              Upload folder
                            </span>
                          </Button>
                          <Button secondary onClick={handleNewFolderClick}>
                            <span className="inline-flex items-center gap-2">
                              <IconFolder24 />
                              New folder
                            </span>
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </NoticeBox>
              </div>
            ) : (
              <FileGrid
                items={filteredFiles}
                viewMode={viewMode}
                onItemClick={handleItemClick}
                onItemAction={handleItemAction}
                folderChildCounts={folderChildCounts}
                selectedItems={selectedItems}
                showCheckboxes={showCheckboxes}
                onItemTap={handleItemTap}
                onSelectChange={handleSelectChange}
              />
            )}
            
            {/* Debug Panel removed */}
          </div>
        </main>
      </div>
      
      <NewFolderDialog
        open={showNewFolderDialog}
        onOpenChange={setShowNewFolderDialog}
        onCreateFolder={handleCreateFolder}
      />
      
      <FileUploadDialog
        open={showFileUploadDialog}
        onOpenChange={setShowFileUploadDialog}
        onUploadComplete={handleFileUploadComplete}
        currentFolderId={currentFolderId}
        currentFolderName={getCurrentFolderName()}
      />
      
      <FolderUploadDialog
        open={showFolderUploadDialog}
        onOpenChange={setShowFolderUploadDialog}
        onUploadComplete={handleFolderUploadComplete}
        currentFolderId={currentFolderId}
        currentFolderName={getCurrentFolderName()}
      />

      {/* Enhanced Feature Dialogs */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          isOpen={showPreview}
          onClose={handlePreviewClose}
          onDownload={handlePreviewDownload}
          onShare={handlePreviewShare}
          onEdit={handlePreviewEdit}
        />
      )}

      {selectedFile && (
        <>
          <MetadataEditor
            file={selectedFile}
            isOpen={showMetadataEditor}
            onClose={() => setShowMetadataEditor(false)}
            onSave={handleMetadataSave}
          />

          <AccessControlDialog
            fileId={selectedFile.id}
            fileName={selectedFile.name}
            permissions={dhis2Permissions}
            users={dhis2Users}
            isOpen={showAccessControl}
            onClose={() => setShowAccessControl(false)}
            onPermissionChange={handlePermissionChange}
          />
        </>
      )}

      <AuditLogDialog
        logs={dhis2AuditLogs}
        isOpen={showAuditLog}
        onClose={() => setShowAuditLog(false)}
      />

      {(selectedFile || (selectedItems && selectedItems.length > 0)) && (
        <ShareDialog
          fileId={selectedFile ? selectedFile.id : ''}
          fileIds={selectedItems && selectedItems.length > 0 ? selectedItems : undefined}
          fileName={selectedFile ? selectedFile.name : `${selectedItems.length} items`}
          users={dhis2Users}
          isOpen={showShare}
          onClose={() => { setShowShare(false); setSelectedFile(null); }}
          onShare={handleShareConfirm}
        />
      )}

      {showDeleteConfirm && deleteTarget && (
        <Modal onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}>
          <div style={{ padding: 20, minWidth: 420 }}>
            <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 16, fontWeight: 600 }}>Delete item</h3>
            <p style={{ margin: '8px 0 16px 0' }}>
              Are you sure you want to delete "{deleteTarget.name}"?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Button secondary onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}>Cancel</Button>
              <Button primary onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* API Status Indicator removed for production */}
      
      {/* Debug Panel - Remove this in production */}
      {/* <DebugPanel
        dhis2Files={dhis2Files}
        dhis2Folders={dhis2Folders}
        allFiles={allFiles}
        filteredFiles={filteredFiles}
        currentFolderId={currentFolderId}
        activeSection={activeSection}
        onRefresh={initializeData}
      />
      
      {/* Test Panel - Remove this in production */}
      {/* <TestPanel
        onCreateFolder={handleCreateFolder}
        onRefresh={initializeData}
      /> */} 
    </div>
  );
}
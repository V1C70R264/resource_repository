import { useState, useEffect } from "react";
import { Upload, Clock, Shield, Tag } from "lucide-react";
import { DHIS2Card } from "@/components/ui/dhis2-components";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Breadcrumb } from "./Breadcrumb";
import { FileGrid } from "./FileGrid";
import { NewFolderDialog } from "./NewFolderDialog";
import { FileUploadDialog } from "./FileUploadDialog";
import { FolderUploadDialog } from "./FolderUploadDialog";
import { AdvancedSearch } from "./AdvancedSearch";
import { AuditLogDialog } from "./AuditLog";
import { AccessControlDialog } from "./AccessControl";
import { FilePreview } from "./FilePreview";
import { MetadataEditor } from "./MetadataEditor";
import { toast } from "sonner";
import { useDHIS2DataStore } from "@/hooks/useDHIS2DataStore";
import { 
  FileMetadata, 
  AuditLog, 
  User, 
  Permission, 
  SearchFilters, 
  PreviewData 
} from "@/lib/types";

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

  // DHIS2 Data Store integration
  const {
    files: dhis2Files,
    folders: dhis2Folders,
    users: dhis2Users,
    auditLogs: dhis2AuditLogs,
    permissions: dhis2Permissions,
    saveFile,
    saveFolder,
    saveAuditLog,
    savePermissions,
    isLoading,
    hasError
  } = useDHIS2DataStore();

  // Combine files and folders from DHIS2
  const allFiles = [...dhis2Files, ...dhis2Folders];

  const filteredFiles = allFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by current folder location
    const inCurrentFolder = currentFolderId ? file.parentId === currentFolderId : !file.parentId;
    
    switch (activeSection) {
      case 'shared':
        return matchesSearch && file.shared && inCurrentFolder;
      case 'starred':
        return matchesSearch && file.starred && inCurrentFolder;
      case 'recent':
        return matchesSearch && inCurrentFolder; // For demo, showing all files as recent
      case 'trash':
        return false; // No files in trash for demo
      default:
        return matchesSearch && inCurrentFolder;
    }
  });

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      setBreadcrumbs(prev => [...prev, { 
        id: item.id, 
        name: item.name, 
        path: `/${item.name}` 
      }]);
      toast(`Opened folder: ${item.name}`);
    }
  };

  const handleItemAction = (action: string, item: FileItem) => {
    switch (action) {
      case 'preview':
        if (item.type === 'file') {
          const previewData: PreviewData = {
            fileId: item.id,
            fileName: item.name,
            fileType: item.fileType || 'unknown',
            mimeType: item.mimeType || 'application/octet-stream',
            url: `/api/files/${item.id}/preview`,
            thumbnail: item.thumbnail,
            canEdit: true, // This would be determined by permissions
          };
          setPreviewFile(previewData);
          setShowPreview(true);
          
          // Log the preview action
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
        }
        break;
      case 'download':
        toast(`Downloading: ${item.name}`);
        break;
      case 'share':
        toast(`Sharing: ${item.name}`);
        break;
      case 'star':
        const updatedItem = { ...item, starred: !item.starred };
        if (item.type === 'file') {
          saveFile(updatedItem);
        } else {
          saveFolder(updatedItem);
        }
        toast(`${item.starred ? 'Removed star from' : 'Starred'}: ${item.name}`);
        break;
      case 'delete':
        toast(`Moved to trash: ${item.name}`);
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
        toast(`Action ${action} on: ${item.name}`);
    }
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
      
      toast(`Navigated to: ${newBreadcrumbs[clickedIndex].name}`);
    }
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: FileItem = {
      id: `folder_${Date.now()}`,
      name,
      type: 'folder',
      modified: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      owner: 'You',
      starred: false,
      shared: false,
      tags: ['folder'],
      parentId: currentFolderId || undefined,
      created: new Date().toISOString(),
      path: ""
    };
    
    saveFolder(newFolder);
    toast(`Created folder: ${name}`);
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

  const handleFileUploadComplete = async (uploadedFiles: File[], folderId?: string) => {
    const newFiles: FileItem[] = uploadedFiles.map(file => {
      const fileType = getFileType(file.name);
      return {
        id: `file_${Date.now()}_${Math.random()}`,
        name: file.name,
        type: 'file',
        fileType,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        modified: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        owner: 'You',
        starred: false,
        shared: false,
        tags: [fileType],
        parentId: folderId || undefined,
        created: new Date().toISOString(),
        path: ""
      };
    });
    
    // Save files to DHIS2 Data Store
    for (const file of newFiles) {
      await saveFile(file);
    }
    toast(`Uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`);
  };

  const handleFolderUploadComplete = async (uploadedFolders: { name: string; files: File[] }[], folderId?: string) => {
    const newItems: FileItem[] = [];
    
    uploadedFolders.forEach(folder => {
      // Create the folder
      const folderId = `folder_${Date.now()}_${Math.random()}`;
      const folderItem: FileItem = {
        id: folderId,
        name: folder.name,
        type: 'folder',
        modified: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        owner: 'You',
        starred: false,
        shared: false,
        tags: ['folder'],
        parentId: currentFolderId || undefined,
        created: new Date().toISOString(),
        path: ""
      };
      newItems.push(folderItem);
      
      // Create files inside the folder
      folder.files.forEach(file => {
        const fileType = getFileType(file.name);
        const fileItem: FileItem = {
          id: `file_${Date.now()}_${Math.random()}`,
          name: file.name,
          type: 'file',
          fileType,
          size: file.size,
          sizeFormatted: formatFileSize(file.size),
          modified: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          owner: 'You',
          starred: false,
          shared: false,
          tags: [fileType],
          parentId: folderId,
          created: new Date().toISOString(),
          path: ""
        };
        newItems.push(fileItem);
      });
    });
    
    // Save folders and files to DHIS2 Data Store
    for (const item of newItems) {
      if (item.type === 'file') {
        await saveFile(item);
      } else {
        await saveFolder(item);
      }
    }
    toast(`Uploaded ${uploadedFolders.length} folder${uploadedFolders.length > 1 ? 's' : ''}`);
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
      handleFileUploadComplete(files, currentFolderId);
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
  const handleSearchFiltersChange = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleMetadataSave = (metadata: FileMetadata) => {
    if (metadata.type === 'file') {
      saveFile(metadata as any);
    } else {
      saveFolder(metadata as any);
    }
    toast('Metadata updated successfully');
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
    toast(`Permission ${action}ed successfully`);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  const handlePreviewDownload = () => {
    toast('Download started');
  };

  const handlePreviewShare = () => {
    toast('Share dialog opened');
  };

  const handlePreviewEdit = () => {
    toast('Edit mode activated');
  };

  // Get available data for filters
  const availableTags = Array.from(new Set(allFiles.flatMap(f => f.tags || []))) as string[];
  const availableFileTypes = Array.from(new Set(allFiles.map(f => f.fileType).filter(Boolean))) as string[];
  const availableOwners = Array.from(new Set(allFiles.map(f => f.owner))) as string[];

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
              <Header />
        
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
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border bg-background/50 backdrop-blur-sm">
            <Breadcrumb
              items={breadcrumbs}
              onNavigate={handleBreadcrumbNavigate}
            />
          </div>
          
          <div 
            className={`flex-1 p-6 overflow-auto transition-colors ${
              isDragOver ? 'bg-drive-blue/5 border-2 border-dashed border-drive-blue' : ''
            }`}
            onDragOver={handleMainAreaDragOver}
            onDragLeave={handleMainAreaDragLeave}
            onDrop={handleMainAreaDrop}
          >
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
              
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {activeSection === 'my-drive' && 'My Drive'}
                {activeSection === 'shared' && 'Shared with me'}
                {activeSection === 'recent' && 'Recent'}
                {activeSection === 'starred' && 'Starred'}
                {activeSection === 'trash' && 'Trash'}
              </h2>
              <p className="text-muted-foreground">
                {filteredFiles.length} {filteredFiles.length === 1 ? 'item' : 'items'}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
            
            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-muted-foreground/20 rounded-lg"></div>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? 'No files found' : 'This folder is empty'}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {searchQuery 
                    ? `No files or folders match "${searchQuery}". Try adjusting your search terms.`
                    : 'Get started by uploading files or creating folders.'
                  }
                </p>
              </div>
            ) : (
              <FileGrid
                items={filteredFiles}
                viewMode={viewMode}
                onItemClick={handleItemClick}
                onItemAction={handleItemAction}
              />
            )}
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
    </div>
  );
}
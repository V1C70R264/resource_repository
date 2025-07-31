import { useState } from "react";
import { Upload } from "lucide-react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Breadcrumb } from "./Breadcrumb";
import { FileGrid } from "./FileGrid";
import { NewFolderDialog } from "./NewFolderDialog";
import { FileUploadDialog } from "./FileUploadDialog";
import { FolderUploadDialog } from "./FolderUploadDialog";
import { toast } from "sonner";

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  size?: string;
  modified: string;
  owner: string;
  starred: boolean;
  shared: boolean;
  thumbnail?: string;
  tags?: string[];
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
    modified: 'Oct 25, 2024',
    owner: 'John Doe',
    starred: true,
    shared: false,
    tags: ['important', 'docs']
  },
  {
    id: '2',
    name: 'Design Assets',
    type: 'folder',
    modified: 'Oct 24, 2024',
    owner: 'Jane Smith',
    starred: false,
    shared: true,
    tags: ['design', 'ui']
  },
  {
    id: '3',
    name: 'Annual Report 2024.pdf',
    type: 'file',
    fileType: 'document',
    size: '2.4 MB',
    modified: 'Oct 23, 2024',
    owner: 'Mike Johnson',
    starred: false,
    shared: true,
    tags: ['report', 'finance']
  },
  {
    id: '4',
    name: 'Team Photo.jpg',
    type: 'file',
    fileType: 'image',
    size: '1.8 MB',
    modified: 'Oct 22, 2024',
    owner: 'Sarah Wilson',
    starred: true,
    shared: false,
    tags: ['team', 'photos']
  },
  {
    id: '5',
    name: 'Presentation Video.mp4',
    type: 'file',
    fileType: 'video',
    size: '45.2 MB',
    modified: 'Oct 21, 2024',
    owner: 'Alex Brown',
    starred: false,
    shared: true,
    tags: ['presentation', 'video']
  },
  {
    id: '6',
    name: 'Meeting Recording.mp3',
    type: 'file',
    fileType: 'audio',
    size: '12.5 MB',
    modified: 'Oct 20, 2024',
    owner: 'Lisa Davis',
    starred: false,
    shared: false,
    tags: ['meeting', 'audio']
  },
  {
    id: '7',
    name: 'Archive Files.zip',
    type: 'file',
    fileType: 'archive',
    size: '156.7 MB',
    modified: 'Oct 19, 2024',
    owner: 'Tom Wilson',
    starred: false,
    shared: false,
    tags: ['archive', 'backup']
  },
  {
    id: '8',
    name: 'Marketing Materials',
    type: 'folder',
    modified: 'Oct 18, 2024',
    owner: 'Emily Chen',
    starred: false,
    shared: true,
    tags: ['marketing', 'materials']
  },
  {
    id: '9',
    name: 'Budget Spreadsheet.xlsx',
    type: 'file',
    fileType: 'document',
    size: '890 KB',
    modified: 'Oct 17, 2024',
    owner: 'John Doe',
    starred: true,
    shared: false,
    tags: ['budget', 'finance']
  },
  {
    id: '10',
    name: 'Logo Design.png',
    type: 'file',
    fileType: 'image',
    size: '245 KB',
    modified: 'Oct 16, 2024',
    owner: 'Design Team',
    starred: false,
    shared: true,
    tags: ['logo', 'branding']
  },
  {
    id: '11',
    name: 'Client Resources',
    type: 'folder',
    modified: 'Oct 15, 2024',
    owner: 'Customer Success',
    starred: false,
    shared: true,
    tags: ['client', 'resources']
  },
  {
    id: '12',
    name: 'Training Manual.docx',
    type: 'file',
    fileType: 'document',
    size: '3.2 MB',
    modified: 'Oct 14, 2024',
    owner: 'HR Department',
    starred: false,
    shared: false,
    tags: ['training', 'manual']
  }
];

export function ResourceRepository() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('my-drive');
  const [files, setFiles] = useState<FileItem[]>(sampleFiles);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'My Drive', path: '/' }
  ]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const [showFolderUploadDialog, setShowFolderUploadDialog] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const filteredFiles = files.filter(file => {
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
        toast(`Previewing: ${item.name}`);
        break;
      case 'download':
        toast(`Downloading: ${item.name}`);
        break;
      case 'share':
        toast(`Sharing: ${item.name}`);
        break;
      case 'star':
        setFiles(prev => prev.map(f => 
          f.id === item.id ? { ...f, starred: !f.starred } : f
        ));
        toast(`${item.starred ? 'Removed star from' : 'Starred'}: ${item.name}`);
        break;
      case 'delete':
        toast(`Moved to trash: ${item.name}`);
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
      parentId: currentFolderId || undefined
    };
    
    setFiles(prev => [...prev, newFolder]);
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

  const handleFileUploadComplete = (uploadedFiles: File[], folderId?: string) => {
    const newFiles: FileItem[] = uploadedFiles.map(file => {
      const fileType = getFileType(file.name);
      return {
        id: `file_${Date.now()}_${Math.random()}`,
        name: file.name,
        type: 'file',
        fileType,
        size: formatFileSize(file.size),
        modified: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        owner: 'You',
        starred: false,
        shared: false,
        tags: [fileType],
        parentId: folderId || undefined
      };
    });
    
    setFiles(prev => [...prev, ...newFiles]);
    toast(`Uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`);
  };

  const handleFolderUploadComplete = (uploadedFolders: { name: string; files: File[] }[], folderId?: string) => {
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
        parentId: currentFolderId || undefined
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
          size: formatFileSize(file.size),
          modified: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          owner: 'You',
          starred: false,
          shared: false,
          tags: [fileType],
          parentId: folderId
        };
        newItems.push(fileItem);
      });
    });
    
    setFiles(prev => [...prev, ...newItems]);
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

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
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
                  <div className="bg-background border-2 border-dashed border-drive-blue rounded-lg p-8 text-center">
                    <Upload className="w-16 h-16 text-drive-blue mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Drop files here</h3>
                    <p className="text-muted-foreground">
                      Upload files to {getCurrentFolderName()}
                    </p>
                  </div>
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
    </div>
  );
}
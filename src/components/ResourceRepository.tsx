import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Breadcrumb } from "./Breadcrumb";
import { FileGrid } from "./FileGrid";
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

const breadcrumbItems = [
  { id: 'root', name: 'My Drive', path: '/' },
  { id: 'documents', name: 'Documents', path: '/documents' },
];

export function ResourceRepository() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('my-drive');
  const [files, setFiles] = useState<FileItem[]>(sampleFiles);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    switch (activeSection) {
      case 'shared':
        return matchesSearch && file.shared;
      case 'starred':
        return matchesSearch && file.starred;
      case 'recent':
        return matchesSearch; // For demo, showing all files as recent
      case 'trash':
        return false; // No files in trash for demo
      default:
        return matchesSearch;
    }
  });

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'folder') {
      toast(`Opening folder: ${item.name}`);
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
    toast(`Navigating to: ${path}`);
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
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border bg-background/50 backdrop-blur-sm">
            <Breadcrumb
              items={breadcrumbItems}
              onNavigate={handleBreadcrumbNavigate}
            />
          </div>
          
          <div className="flex-1 p-6 overflow-auto">
            <div className="mb-6">
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
    </div>
  );
}
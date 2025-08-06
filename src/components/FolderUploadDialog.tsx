import { useState, useRef } from "react";
import { Modal, Button } from "@dhis2/ui";
import { 
  IconFolder24, 
  IconCheckmark24,
  IconUpload24
} from "@dhis2/ui-icons";

interface FolderUploadItem {
  id: string;
  name: string;
  files: File[];
  status: 'pending' | 'uploading' | 'completed';
  progress: number;
}

interface FolderUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (folders: { name: string; files: File[] }[], folderId?: string) => void;
  currentFolderId?: string | null;
  currentFolderName?: string;
}

export function FolderUploadDialog({ 
  open, 
  onOpenChange, 
  onUploadComplete, 
  currentFolderId,
  currentFolderName 
}: FolderUploadDialogProps) {
  const [uploadFolders, setUploadFolders] = useState<FolderUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = (files: FileList | null) => {
    if (!files) return;

    // Group files by their folder path
    const folderMap = new Map<string, File[]>();
    
    Array.from(files).forEach(file => {
      // Get the first folder name from the webkitRelativePath
      const pathParts = file.webkitRelativePath.split('/');
      const folderName = pathParts[0];
      
      if (!folderMap.has(folderName)) {
        folderMap.set(folderName, []);
      }
      folderMap.get(folderName)!.push(file);
    });

    const newFolders: FolderUploadItem[] = Array.from(folderMap.entries()).map(([name, files]) => ({
      id: `${name}-${Date.now()}-${Math.random()}`,
      name,
      files,
      status: 'pending',
      progress: 0
    }));

    setUploadFolders(prev => [...prev, ...newFolders]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const items = Array.from(e.dataTransfer.items);
    const files: File[] = [];
    
    items.forEach(item => {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry?.isDirectory) {
          // Handle directory drop - this is more complex and would need recursive reading
          // For now, we'll show a message to use the folder input
          console.log('Directory dropped, use folder input instead');
        }
      }
    });
  };

  const removeFolder = (id: string) => {
    setUploadFolders(prev => prev.filter(f => f.id !== id));
  };

  const simulateUpload = async (folderItem: FolderUploadItem) => {
    setUploadFolders(prev => prev.map(f => 
      f.id === folderItem.id ? { ...f, status: 'uploading' } : f
    ));

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setUploadFolders(prev => prev.map(f => 
        f.id === folderItem.id ? { ...f, progress } : f
      ));
    }

    setUploadFolders(prev => prev.map(f => 
      f.id === folderItem.id ? { ...f, status: 'completed', progress: 100 } : f
    ));
  };

  const handleUpload = async () => {
    const pendingFolders = uploadFolders.filter(f => f.status === 'pending');
    
    // Start uploading all pending folders
    await Promise.all(pendingFolders.map(folderItem => simulateUpload(folderItem)));
    
    // Call the completion handler
    const completedFolders = uploadFolders.map(f => ({ name: f.name, files: f.files }));
    onUploadComplete(completedFolders, currentFolderId);
    
    // Clear and close
    setUploadFolders([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setUploadFolders([]);
    onOpenChange(false);
  };

  const formatFileCount = (count: number) => {
    return `${count} ${count === 1 ? 'file' : 'files'}`;
  };

  const pendingCount = uploadFolders.filter(f => f.status === 'pending').length;
  const completedCount = uploadFolders.filter(f => f.status === 'completed').length;
  const totalCount = uploadFolders.length;

  return (
    <>
      {open && (
        <Modal
          onClose={() => onOpenChange(false)}
        >
          <div style={{ padding: '24px', maxWidth: '600px', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '8px',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                <IconUpload24 />
                Upload folders
              </div>
              <div style={{ 
                color: '#666', 
                fontSize: '14px'
              }}>
                {currentFolderName 
                  ? `Upload folders to "${currentFolderName}" folder`
                  : "Upload folders to My Drive"
                }
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Drop Zone */}
              <div
                style={{
                  border: `2px dashed ${isDragOver ? '#2196f3' : '#e1e5e9'}`,
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: isDragOver ? '#e3f2fd' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  color: '#666',
                  margin: '0 auto 12px auto',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <IconFolder24 />
                </div>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Select folders to upload
                </h3>
                <p style={{ 
                  color: '#666', 
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  Upload entire folders with all their contents
                </p>
                <Button
                  secondary
                  onClick={() => folderInputRef.current?.click()}
                >
                  Browse folders
                </Button>
                <input
                  ref={folderInputRef}
                  type="file"
                  {...({ webkitdirectory: "" } as any)}
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFolderSelect(e.target.files)}
                />
              </div>

              {/* Folder List */}
              {uploadFolders.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}>
                    <h4 style={{ fontWeight: '500', fontSize: '16px' }}>
                      Folders to upload ({totalCount})
                    </h4>
                    {completedCount > 0 && (
                      <span style={{ 
                        fontSize: '14px', 
                        color: '#666'
                      }}>
                        {completedCount} of {totalCount} completed
                      </span>
                    )}
                  </div>
                  
                  <div style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    border: '1px solid #e1e5e9',
                    borderRadius: '8px',
                    padding: '8px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {uploadFolders.map((folderItem) => (
                        <div
                          key={folderItem.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px'
                          }}
                        >
                          <div style={{ color: '#2196f3' }}>
                            <IconFolder24 />
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ 
                              fontSize: '14px', 
                              fontWeight: '500',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {folderItem.name}
                            </p>
                            <p style={{ 
                              fontSize: '12px', 
                              color: '#666'
                            }}>
                              {formatFileCount(folderItem.files.length)}
                            </p>
                            
                            {folderItem.status === 'uploading' && (
                              <div style={{ 
                                height: '4px', 
                                backgroundColor: '#e1e5e9', 
                                borderRadius: '2px', 
                                marginTop: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  width: `${folderItem.progress}%`, 
                                  height: '100%', 
                                  backgroundColor: '#2196f3', 
                                  borderRadius: '2px',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {folderItem.status === 'completed' && (
                              <div style={{ color: '#4caf50' }}>
                                <IconCheckmark24 />
                              </div>
                            )}
                            {folderItem.status === 'pending' && (
                              <Button
                                secondary
                                onClick={() => removeFolder(folderItem.id)}
                                style={{ padding: '4px', minWidth: '32px', height: '32px' }}
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              paddingTop: '16px',
              borderTop: '1px solid #e1e5e9',
              marginTop: '16px'
            }}>
              <Button secondary onClick={handleClose}>
                Cancel
              </Button>
              <Button
                primary
                onClick={handleUpload}
                disabled={pendingCount === 0}
              >
                Upload {pendingCount > 0 ? `${pendingCount} folders` : ''}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
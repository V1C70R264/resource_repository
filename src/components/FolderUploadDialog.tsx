import { useState, useRef } from "react";
import { Modal, Button } from "@dhis2/ui";
import { 
  IconFolder24, 
  IconCheckmark24,
  IconUpload24
} from "@dhis2/ui-icons";
import { toast } from "sonner";
import { dataStoreAPI, DHIS2Folder } from "@/lib/dhis2-api";

interface FolderUploadItem {
  id: string;
  name: string;
  files: File[];
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface FolderUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (result: { createdFolders: any[]; uploadedFiles: any[] }, folderId?: string) => void;
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
  const [isUploading, setIsUploading] = useState(false);
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
    // For folder drag-and-drop, browsers differ; rely on the folder picker for now
  };

  const removeFolder = (id: string) => {
    setUploadFolders(prev => prev.filter(f => f.id !== id));
  };

  // Ensure a folder exists by name under a parent. Uses cache of existing folders to avoid duplicates.
  const ensureFolder = async (
    name: string, 
    parentId: string | undefined, 
    folderCache: Map<string, DHIS2Folder>
  ): Promise<DHIS2Folder> => {
    const cacheKey = `${parentId || 'root'}|${name}`;
    const cached = folderCache.get(cacheKey);
    if (cached) return cached;

    // Try to find in existing folders (first load all folders once outside)
    const existingFolders = await dataStoreAPI.getAllFolders();
    const found = existingFolders.find(f => f.name === name && f.parentId === parentId);
    if (found) {
      folderCache.set(cacheKey, found);
      return found;
    }

    // Create if not found
    const created = await dataStoreAPI.createFolder(name, parentId);
    folderCache.set(cacheKey, created);
    return created;
  };

  const uploadSingleFolder = async (
    folderItem: FolderUploadItem,
    parentId: string | undefined
  ): Promise<{ createdFolders: any[]; uploadedFiles: any[] }> => {
    setUploadFolders(prev => prev.map(f => 
      f.id === folderItem.id ? { ...f, status: 'uploading', progress: 10 } : f
    ));

    const createdFolders: any[] = [];
    const uploadedFiles: any[] = [];

    try {
      // Cache to prevent duplicate subfolder creation
      const folderCache = new Map<string, DHIS2Folder>();

      // Create root folder under current parent
      const rootFolder = await ensureFolder(folderItem.name, parentId, folderCache);
      createdFolders.push(rootFolder);

      // Progress helper
      const total = folderItem.files.length;
      let completed = 0;

      // Process each file, creating subfolders according to relative path
      for (const file of folderItem.files) {
        // webkitRelativePath: Root/sub1/sub2/file.ext
        const parts = file.webkitRelativePath.split('/');
        // parts[0] is root folder name
        const subparts = parts.slice(1, -1); // folder segments below root

        let currentParentId = rootFolder.id;
        // Create/ensure all subfolders
        for (const sub of subparts) {
          const subFolder = await ensureFolder(sub, currentParentId, folderCache);
          createdFolders.push(subFolder);
          currentParentId = subFolder.id;
        }

        // Upload the file to the deepest folder
        const uploaded = await dataStoreAPI.uploadFile(file, currentParentId);
        uploadedFiles.push(uploaded);

        completed += 1;
        const progress = Math.min(10 + Math.round((completed / total) * 80), 90);
        setUploadFolders(prev => prev.map(f => 
          f.id === folderItem.id ? { ...f, progress } : f
        ));
      }

      setUploadFolders(prev => prev.map(f => 
        f.id === folderItem.id ? { ...f, status: 'completed', progress: 100 } : f
      ));

      return { createdFolders, uploadedFiles };
    } catch (error) {
      console.error('[DEBUG] Folder upload error:', error);
      setUploadFolders(prev => prev.map(f => 
        f.id === folderItem.id ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' } : f
      ));
      return { createdFolders, uploadedFiles };
    }
  };

  const handleUpload = async () => {
    const pendingFolders = uploadFolders.filter(f => f.status === 'pending');

    if (pendingFolders.length === 0) {
      toast.error('No folders to upload');
      return;
    }

    setIsUploading(true);

    try {
      const aggregateCreated: any[] = [];
      const aggregateFiles: any[] = [];

      // Sequential to avoid overwhelming API
      for (const folderItem of pendingFolders) {
        const result = await uploadSingleFolder(folderItem, currentFolderId || undefined);
        aggregateCreated.push(...result.createdFolders);
        aggregateFiles.push(...result.uploadedFiles);
      }

      // Notify parent; it will refresh folders/files
      onUploadComplete({ createdFolders: aggregateCreated, uploadedFiles: aggregateFiles }, currentFolderId || undefined);

      // Clear and close after short delay
      setTimeout(() => {
        setUploadFolders([]);
        setIsUploading(false);
        onOpenChange(false);
      }, 800);

    } catch (error) {
      console.error('[DEBUG] Error during folder upload:', error);
      toast.error('Folder upload failed');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setUploadFolders([]);
    setIsUploading(false);
    onOpenChange(false);
  };

  const formatFileCount = (count: number) => {
    return `${count} ${count === 1 ? 'file' : 'files'}`;
  };

  const pendingCount = uploadFolders.filter(f => f.status === 'pending').length;
  const completedCount = uploadFolders.filter(f => f.status === 'completed').length;
  const errorCount = uploadFolders.filter(f => f.status === 'error').length;
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
                  disabled={isUploading}
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
                  disabled={isUploading}
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
                    <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#666' }}>
                      {completedCount > 0 && (
                        <span style={{ color: '#4caf50' }}>
                          {completedCount} completed
                        </span>
                      )}
                      {errorCount > 0 && (
                        <span style={{ color: '#f44336' }}>
                          {errorCount} failed
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span>
                          {pendingCount} pending
                        </span>
                      )}
                    </div>
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
                            backgroundColor: folderItem.status === 'error' ? '#ffebee' : 
                                           folderItem.status === 'completed' ? '#e8f5e8' : '#f8f9fa',
                            borderRadius: '6px',
                            border: folderItem.status === 'error' ? '1px solid #ffcdd2' : 'none'
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
                                disabled={isUploading}
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
              <Button secondary onClick={handleClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                primary
                onClick={handleUpload}
                disabled={pendingCount === 0 || isUploading}
              >
                {isUploading ? 'Uploading...' : `Upload ${pendingCount > 0 ? `${pendingCount} folders` : ''}`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
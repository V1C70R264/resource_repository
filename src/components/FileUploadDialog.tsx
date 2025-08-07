import { useState, useRef } from "react";
import { Modal, Button, Input } from "@dhis2/ui";
import { 
  IconUpload24, 
  IconFileDocument24, 
  IconCheckmark24, 
  IconWarning24
} from "@dhis2/ui-icons";
import { toast } from "sonner";
import { uploadFileToNamespace } from "@/lib/dhis2-api";

interface FileUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (files: File[], folderId?: string) => void;
  currentFolderId?: string | null;
  currentFolderName?: string;
}

export function FileUploadDialog({ 
  open, 
  onOpenChange, 
  onUploadComplete, 
  currentFolderId,
  currentFolderName 
}: FileUploadDialogProps) {
  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: FileUploadItem[] = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
      progress: 0
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
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
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const simulateUpload = async (fileItem: FileUploadItem) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileItem.id ? { ...f, status: 'uploading' } : f
    ));

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, progress } : f
      ));
    }

    setUploadFiles(prev => prev.map(f => 
      f.id === fileItem.id ? { ...f, status: 'completed', progress: 100 } : f
    ));
  };

  const handleUpload = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');

    await Promise.all(pendingFiles.map(async (fileItem) => {
      console.log(`[DEV] Attempting to upload file: ${fileItem.file.name} to folder/namespace: ${currentFolderName}`);
      const success = await uploadFileToNamespace(currentFolderName || 'my-drive', fileItem.file);
      if (success) {
        toast.success(`File "${fileItem.file.name}" uploaded successfully`);
      } else {
        toast.error(`Failed to upload file "${fileItem.file.name}"`);
      }
    }));

    // Call the completion handler with the actual files
    const completedFiles = uploadFiles.map(f => f.file);
    onUploadComplete(completedFiles, currentFolderId);

    // Clear and close
    setUploadFiles([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setUploadFiles([]);
    onOpenChange(false);
  };

  const getFileIcon = (fileName: string) => {
    return <IconFileDocument24 />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pendingCount = uploadFiles.filter(f => f.status === 'pending').length;
  const completedCount = uploadFiles.filter(f => f.status === 'completed').length;
  const totalCount = uploadFiles.length;

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
                Upload files
              </div>
              <div style={{ 
                color: '#666', 
                fontSize: '14px'
              }}>
                {currentFolderName 
                  ? `Upload files to "${currentFolderName}" folder`
                  : "Upload files to My Drive"
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
                   <IconUpload24 />
                 </div>
                                 <h3 style={{ 
                   fontSize: '16px', 
                   fontWeight: '500', 
                   marginBottom: '6px',
                   color: '#333'
                 }}>
                   {isDragOver ? 'Drop files here' : 'Drag files here or click to browse'}
                 </h3>
                 <p style={{ 
                   color: '#666', 
                   marginBottom: '12px',
                   fontSize: '14px'
                 }}>
                   You can upload multiple files at once
                 </p>
                <Button
                  secondary
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>

              {/* File List */}
              {uploadFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}>
                    <h4 style={{ fontWeight: '500', fontSize: '16px' }}>
                      Files to upload ({totalCount})
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
                      {uploadFiles.map((fileItem) => (
                        <div
                          key={fileItem.id}
                                                     style={{
                             display: 'flex',
                             alignItems: 'center',
                             gap: '12px',
                             padding: '8px',
                             backgroundColor: '#f8f9fa',
                             borderRadius: '6px'
                           }}
                        >
                          {getFileIcon(fileItem.file.name)}
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ 
                              fontSize: '14px', 
                              fontWeight: '500',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {fileItem.file.name}
                            </p>
                            <p style={{ 
                              fontSize: '12px', 
                              color: '#666'
                            }}>
                              {formatFileSize(fileItem.file.size)}
                            </p>
                            
                            {fileItem.status === 'uploading' && (
                              <div style={{ 
                                height: '4px', 
                                backgroundColor: '#e1e5e9', 
                                borderRadius: '2px', 
                                marginTop: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  width: `${fileItem.progress}%`, 
                                  height: '100%', 
                                  backgroundColor: '#2196f3', 
                                  borderRadius: '2px',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                            )}
                          </div>

                                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             {fileItem.status === 'completed' && (
                               <div style={{ color: '#4caf50' }}>
                                 <IconCheckmark24 />
                               </div>
                             )}
                             {fileItem.status === 'error' && (
                               <div style={{ color: '#f44336' }}>
                                 <IconWarning24 />
                               </div>
                             )}
                             {fileItem.status === 'pending' && (
                               <Button
                                 secondary
                                 onClick={() => removeFile(fileItem.id)}
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
                Upload {pendingCount > 0 ? `${pendingCount} files` : ''}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
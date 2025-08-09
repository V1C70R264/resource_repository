import { useState, useRef } from "react";
import { Modal, Button, Input } from "@dhis2/ui";
import { 
  IconUpload24, 
  IconFileDocument24, 
  IconCheckmark24, 
  IconWarning24
} from "@dhis2/ui-icons";
import { toast } from "sonner";
import { dataStoreAPI } from "@/lib/dhis2-api";

interface FileUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  uploadedFile?: any; // DHIS2File object after successful upload
}

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (files: any[], folderId?: string) => void;
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
  const [isUploading, setIsUploading] = useState(false);
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

  // Return the uploaded file object on success, null on failure
  const uploadSingleFile = async (fileItem: FileUploadItem): Promise<any | null> => {
    try {
      // Update status to uploading
      setUploadFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'uploading', progress: 10 } : f
      ));

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => {
          if (f.id === fileItem.id && f.status === 'uploading' && f.progress < 90) {
            return { ...f, progress: Math.min(f.progress + 10, 90) };
          }
          return f;
        }));
      }, 200);

      // Upload file using DHIS2 DataStore API
      const uploadedFile = await dataStoreAPI.uploadFile(fileItem.file, currentFolderId || undefined);
      
      clearInterval(progressInterval);
      
      // Update status to completed and store the uploaded file object
      setUploadFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { 
          ...f, 
          status: 'completed', 
          progress: 100, 
          uploadedFile 
        } : f
      ));

      console.log(`[DEBUG] File "${fileItem.file.name}" uploaded successfully:`, uploadedFile);
      return uploadedFile;

    } catch (error) {
      console.error(`[DEBUG] Error uploading file "${fileItem.file.name}":`, error);
      
      // Update status to error
      setUploadFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ));

      return null;
    }
  };

  const handleUpload = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    setIsUploading(true);

    try {
      const successfulUploads: any[] = [];
      // Upload files sequentially to avoid overwhelming the API
      for (const fileItem of pendingFiles) {
        const uploaded = await uploadSingleFile(fileItem);
        if (uploaded) {
          successfulUploads.push(uploaded);
          toast.success(`File "${fileItem.file.name}" uploaded successfully`);
        } else {
          toast.error(`Failed to upload file "${fileItem.file.name}"`);
        }
      }

      // Always notify parent to refresh UI, even if 0 succeeded
      onUploadComplete(successfulUploads, currentFolderId || undefined);

      // Clear and close after a short delay to show completion
      setTimeout(() => {
        setUploadFiles([]);
        setIsUploading(false);
        onOpenChange(false);
      }, 800);

    } catch (error) {
      console.error('[DEBUG] Error during batch upload:', error);
      toast.error('Upload process failed');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setUploadFiles([]);
    setIsUploading(false);
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
  const errorCount = uploadFiles.filter(f => f.status === 'error').length;
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
                  You can upload multiple files at once (max 50MB per file)
                </p>
                <Button
                  secondary
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Browse files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  disabled={isUploading}
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
                      {uploadFiles.map((fileItem) => (
                        <div
                          key={fileItem.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px',
                            backgroundColor: fileItem.status === 'error' ? '#ffebee' : 
                                           fileItem.status === 'completed' ? '#e8f5e8' : '#f8f9fa',
                            borderRadius: '6px',
                            border: fileItem.status === 'error' ? '1px solid #ffcdd2' : 'none'
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

                            {fileItem.status === 'error' && fileItem.error && (
                              <p style={{ 
                                fontSize: '12px', 
                                color: '#f44336',
                                marginTop: '4px'
                              }}>
                                {fileItem.error}
                              </p>
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
                {isUploading ? 'Uploading...' : `Upload ${pendingCount > 0 ? `${pendingCount} files` : ''}`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
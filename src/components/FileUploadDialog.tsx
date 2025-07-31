import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, CheckCircle2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    
    // Start uploading all pending files
    await Promise.all(pendingFiles.map(fileItem => simulateUpload(fileItem)));
    
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
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <File className="w-4 h-4 text-muted-foreground" />;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-drive-blue" />
            Upload files
          </DialogTitle>
          <DialogDescription>
            {currentFolderName 
              ? `Upload files to "${currentFolderName}" folder`
              : "Upload files to My Drive"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-drive-blue bg-drive-blue/5' 
                : 'border-muted-foreground/25 hover:border-drive-blue/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isDragOver ? 'Drop files here' : 'Drag files here or click to browse'}
            </h3>
            <p className="text-muted-foreground mb-4">
              You can upload multiple files at once
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Files to upload ({totalCount})
                </h4>
                {completedCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {completedCount} of {totalCount} completed
                  </span>
                )}
              </div>
              
              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {uploadFiles.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      {getFileIcon(fileItem.file.name)}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fileItem.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                        
                        {fileItem.status === 'uploading' && (
                          <Progress value={fileItem.progress} className="h-1 mt-1" />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {fileItem.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {fileItem.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        {fileItem.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => removeFile(fileItem.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="drive"
            onClick={handleUpload}
            disabled={pendingCount === 0}
          >
            Upload {pendingCount > 0 ? `${pendingCount} files` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
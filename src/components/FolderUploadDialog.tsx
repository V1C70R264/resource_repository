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
import { FolderUp, X, Folder, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderUp className="w-5 h-5 text-drive-blue" />
            Upload folders
          </DialogTitle>
          <DialogDescription>
            {currentFolderName 
              ? `Upload folders to "${currentFolderName}" folder`
              : "Upload folders to My Drive"
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
            <FolderUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Select folders to upload
            </h3>
            <p className="text-muted-foreground mb-4">
              Upload entire folders with all their contents
            </p>
            <Button
              variant="outline"
              onClick={() => folderInputRef.current?.click()}
            >
              Browse folders
            </Button>
            <input
              ref={folderInputRef}
              type="file"
              {...({ webkitdirectory: "" } as any)}
              multiple
              className="hidden"
              onChange={(e) => handleFolderSelect(e.target.files)}
            />
          </div>

          {/* Folder List */}
          {uploadFolders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Folders to upload ({totalCount})
                </h4>
                {completedCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {completedCount} of {totalCount} completed
                  </span>
                )}
              </div>
              
              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {uploadFolders.map((folderItem) => (
                    <div
                      key={folderItem.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <Folder className="w-4 h-4 text-drive-blue" />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {folderItem.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileCount(folderItem.files.length)}
                        </p>
                        
                        {folderItem.status === 'uploading' && (
                          <Progress value={folderItem.progress} className="h-1 mt-1" />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {folderItem.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {folderItem.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => removeFolder(folderItem.id)}
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
            Upload {pendingCount > 0 ? `${pendingCount} folders` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
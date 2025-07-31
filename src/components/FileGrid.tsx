import { useState } from "react";
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Folder, 
  MoreVertical, 
  Download, 
  Share, 
  Star, 
  Trash2, 
  Eye,
  Edit,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface FileGridProps {
  items: FileItem[];
  viewMode: 'grid' | 'list';
  onItemClick: (item: FileItem) => void;
  onItemAction: (action: string, item: FileItem) => void;
}

export function FileGrid({ items, viewMode, onItemClick, onItemAction }: FileGridProps) {
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getFileIcon = (type: string, fileType?: string) => {
    if (type === 'folder') return Folder;
    
    switch (fileType) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'archive': return Archive;
      default: return FileText;
    }
  };

  const getFileColor = (type: string, fileType?: string) => {
    if (type === 'folder') return 'text-drive-blue';
    
    switch (fileType) {
      case 'image': return 'text-drive-green';
      case 'video': return 'text-red-500';
      case 'audio': return 'text-purple-500';
      case 'archive': return 'text-drive-orange';
      default: return 'text-blue-500';
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'file') {
      setSelectedItem(item);
      setPreviewOpen(true);
    } else {
      onItemClick(item);
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-3 bg-muted/30 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-5">Name</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Last modified</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="divide-y divide-border">
            {items.map((item) => {
              const Icon = getFileIcon(item.type, item.fileType);
              const iconColor = getFileColor(item.type, item.fileType);
              
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                    <span className="font-medium text-foreground truncate">{item.name}</span>
                    {item.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    {item.shared && <Share className="w-4 h-4 text-blue-500" />}
                    <div className="flex gap-1">
                      {item.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                    {item.owner}
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                    {item.modified}
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                    {item.size || '-'}
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onItemAction('preview', item)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onItemAction('download', item)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onItemAction('share', item)}>
                          <Share className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onItemAction('star', item)}>
                          <Star className="mr-2 h-4 w-4" />
                          {item.starred ? 'Remove star' : 'Add star'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onItemAction('delete', item)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedItem && (
                  <>
                    {(() => {
                      const Icon = getFileIcon(selectedItem.type, selectedItem.fileType);
                      return <Icon className={`w-5 h-5 ${getFileColor(selectedItem.type, selectedItem.fileType)}`} />;
                    })()}
                    {selectedItem.name}
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="bg-muted/30 rounded-lg p-8 text-center">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">File preview will be displayed here</p>
                  </div>
                </div>
                <div className="w-80 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{selectedItem.fileType || 'Folder'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{selectedItem.size || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Owner:</span>
                        <span>{selectedItem.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modified:</span>
                        <span>{selectedItem.modified}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      )) || <span className="text-sm text-muted-foreground">No tags</span>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Activity</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Opened 2 hours ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Modified yesterday</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Share className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Shared last week</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="drive" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Grid view
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {items.map((item) => {
          const Icon = getFileIcon(item.type, item.fileType);
          const iconColor = getFileColor(item.type, item.fileType);
          
          return (
            <div
              key={item.id}
              className="group relative bg-background border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-drive-blue/30"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  <Icon className={`w-12 h-12 ${iconColor}`} />
                  {item.starred && (
                    <Star className="absolute -top-2 -right-2 w-4 h-4 text-yellow-500 fill-current" />
                  )}
                  {item.shared && (
                    <Share className="absolute -top-2 -left-2 w-4 h-4 text-blue-500" />
                  )}
                </div>
                
                <div className="w-full">
                  <p className="font-medium text-sm text-foreground truncate" title={item.name}>
                    {item.name}
                  </p>
                  {item.size && (
                    <p className="text-xs text-muted-foreground">{item.size}</p>
                  )}
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onItemAction('preview', item);
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onItemAction('download', item);
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onItemAction('share', item);
                    }}>
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onItemAction('star', item);
                    }}>
                      <Star className="mr-2 h-4 w-4" />
                      {item.starred ? 'Remove star' : 'Add star'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemAction('delete', item);
                      }} 
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && (
                <>
                  {(() => {
                    const Icon = getFileIcon(selectedItem.type, selectedItem.fileType);
                    return <Icon className={`w-5 h-5 ${getFileColor(selectedItem.type, selectedItem.fileType)}`} />;
                  })()}
                  {selectedItem.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[400px] flex items-center justify-center">
                  <div>
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">File preview will be displayed here</p>
                  </div>
                </div>
              </div>
              <div className="w-80 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{selectedItem.fileType || 'Folder'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{selectedItem.size || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <span>{selectedItem.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modified:</span>
                      <span>{selectedItem.modified}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">No tags</span>}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Activity</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Opened 2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Modified yesterday</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Shared last week</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="drive" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
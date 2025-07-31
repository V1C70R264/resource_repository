import { useState } from "react";
import { 
  Plus, 
  HardDrive, 
  Users, 
  Clock, 
  Star, 
  Trash2, 
  FolderPlus, 
  Upload,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onNewFolderClick?: () => void;
  onFileUploadClick?: () => void;
  onFolderUploadClick?: () => void;
}

export function Sidebar({ activeSection, onSectionChange, onNewFolderClick, onFileUploadClick, onFolderUploadClick }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const navigationItems = [
    { id: 'my-drive', label: 'My Drive', icon: HardDrive, count: 156 },
    { id: 'shared', label: 'Shared with me', icon: Users, count: 23 },
    { id: 'recent', label: 'Recent', icon: Clock, count: 45 },
    { id: 'starred', label: 'Starred', icon: Star, count: 12 },
    { id: 'trash', label: 'Trash', icon: Trash2, count: 8 },
  ];

  return (
    <aside className="w-64 bg-background border-r border-border h-full flex flex-col">
      {/* New Button */}
      <div className="p-4 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="drive" className="w-full justify-start gap-3 h-12 shadow-md">
              <Plus className="w-5 h-5" />
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" sideOffset={8}>
            <DropdownMenuItem onClick={onNewFolderClick}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onFileUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              File upload
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onFolderUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              Folder upload
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? 'drive-light' : 'ghost'}
                  className={`w-full justify-start gap-3 h-10 px-3 ${
                    isActive ? 'bg-drive-blue-light border-drive-blue/20' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>

        {/* Storage Usage */}
        <div className="mt-8 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Storage</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          </div>
          
          {isExpanded && (
            <>
              <Progress value={68} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between mb-1">
                  <span>6.8 GB of 10 GB used</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Documents</span>
                    <span>4.2 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images</span>
                    <span>1.8 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span>0.8 GB</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 h-8">
                Buy storage
              </Button>
            </>
          )}
        </div>
      </nav>
    </aside>
  );
}
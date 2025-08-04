import { Search, Grid3X3, List, User, Settings, HelpCircle } from "lucide-react";
import { 
  DHIS2Button, 
  DHIS2Input, 
  DHIS2Header,
  DHIS2DropdownMenu,
  DHIS2DropdownMenuTrigger,
  DHIS2DropdownMenuContent,
  DHIS2DropdownMenuItem,
  DHIS2DropdownMenuSeparator
} from "@/components/ui/dhis2-components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ viewMode, onViewModeChange, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <DHIS2Header>
      {/* Logo and Title - Using Official DHIS2 Design */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/DHIS2.png" 
            alt="DHIS2 Resource Repository Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-semibold text-foreground">DHIS2 Resource Repository</h1>
        </div>
      </div>

      {/* Search Bar - Using Official DHIS2 Input Component */}
      {/* <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <DHIS2Input
            type="text"
            placeholder="Search files, folders, and content..."
            value={searchQuery}
            onChange={(e: any) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 w-full"
          />
        </div>
      </div> */}

      {/* Right Side Actions - Using Official DHIS2 Button Components */}
      <div className="flex items-center gap-2">
        {/* View Toggle - DHIS2 Button Group */}
        <div className="flex border border-border rounded-lg p-1 bg-muted/50">
          <DHIS2Button
            primary={viewMode === 'grid'}
            small
            onClick={() => onViewModeChange('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="w-4 h-4" />
          </DHIS2Button>
          <DHIS2Button
            primary={viewMode === 'list'}
            small
            onClick={() => onViewModeChange('list')}
            className="h-8 w-8 p-0"
          >
            <List className="w-4 h-4" />
          </DHIS2Button>
        </div>

        {/* Help - DHIS2 Basic Button */}
        <DHIS2Button small className="h-8 w-8 p-0">
          <HelpCircle className="w-4 h-4" />
        </DHIS2Button>

        {/* Settings - DHIS2 Basic Button */}
        <DHIS2Button small className="h-8 w-8 p-0">
          <Settings className="w-4 h-4" />
        </DHIS2Button>

        {/* User Menu - DHIS2 Styled */}
        <DHIS2DropdownMenu>
          <DHIS2DropdownMenuTrigger asChild>
            <DHIS2Button className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground">V</AvatarFallback>
              </Avatar>
            </DHIS2Button>
          </DHIS2DropdownMenuTrigger>
          <DHIS2DropdownMenuContent className="w-56" align="end">
            <div className="p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Victor Shirima</p>
                <p className="text-xs leading-none text-muted-foreground">
                  victorshirima29@gmail.com
                </p>
              </div>
            </div>
            <DHIS2DropdownMenuSeparator />
            <DHIS2DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DHIS2DropdownMenuItem>
            <DHIS2DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DHIS2DropdownMenuItem>
            <DHIS2DropdownMenuSeparator />
            <DHIS2DropdownMenuItem>
              Log out
            </DHIS2DropdownMenuItem>
          </DHIS2DropdownMenuContent>
        </DHIS2DropdownMenu>
      </div>
    </DHIS2Header>
  );
}
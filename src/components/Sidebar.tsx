import { useState } from "react";
import { 
  Button, 
  DropdownButton, 
  MenuItem, 
  Chip
} from "@dhis2/ui";
import { 
  IconAdd24, 
  IconFolder24, 
  IconUpload24,
  IconFileDocument24,
  IconShare24,
  IconClock24,
  IconStar24,
  IconArchive24
} from "@dhis2/ui-icons";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onNewFolderClick?: () => void;
  onFileUploadClick?: () => void;
  onFolderUploadClick?: () => void;
  counts?: { myDrive: number; shared: number; recent: number; starred: number; trash: number };
}

export function Sidebar({ activeSection, onSectionChange, onNewFolderClick, onFileUploadClick, onFolderUploadClick, counts }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const navigationItems = [
    { id: 'my-drive', label: 'My Drive', icon: IconFileDocument24, count: counts?.myDrive ?? 0 },
    { id: 'shared', label: 'Shared Items', icon: IconShare24, count: counts?.shared ?? 0 },
    { id: 'recent', label: 'Recent', icon: IconClock24, count: counts?.recent ?? 0 },
    { id: 'starred', label: 'Starred', icon: IconStar24, count: counts?.starred ?? 0 },
    { id: 'trash', label: 'Trash', icon: IconArchive24, count: counts?.trash ?? 0 },
  ];

  return (
    <aside style={{ 
      width: '256px', 
      backgroundColor: '#f8f9fa', 
      borderRight: '1px solid #e1e5e9', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* New Button */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e1e5e9' }}>
        <DropdownButton
          component={
            <>
              <MenuItem 
                label="New folder" 
                onClick={onNewFolderClick}
                icon={<IconAdd24 />}
              />
              <MenuItem 
                label="File upload" 
                onClick={onFileUploadClick}
                icon={<IconUpload24 />}
              />
              <MenuItem 
                label="Folder upload" 
                onClick={onFolderUploadClick}
                icon={<IconFolder24 />}
              />
            </>
          }
          primary
          icon={<IconAdd24 />}
        >
          New
        </DropdownButton>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id} style={{ marginBottom: '6px' }}>
                <Button
                  {...(isActive ? { primary: true } : { secondary: true })}
                  onClick={() => onSectionChange(item.id)}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: '10px',
                    padding: '0 10px',
                  }}
                >
                  <Icon />
                  <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                  <div
                    style={{
                      transform: 'scale(0.85)',
                      transformOrigin: 'right center',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Chip>{item.count}</Chip>
                  </div>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
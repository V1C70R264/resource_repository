import { useState } from "react";
import { 
  Button, 
  DropdownButton, 
  MenuItem, 
  Card,
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
}

export function Sidebar({ activeSection, onSectionChange, onNewFolderClick, onFileUploadClick, onFolderUploadClick }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const navigationItems = [
    { id: 'my-drive', label: 'My Drive', icon: IconFileDocument24, count: 156 },
    { id: 'shared', label: 'Shared Items', icon: IconShare24, count: 23 },
    { id: 'recent', label: 'Recent', icon: IconClock24, count: 45 },
    { id: 'starred', label: 'Starred', icon: IconStar24, count: 12 },
    { id: 'trash', label: 'Trash', icon: IconArchive24, count: 8 },
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
              <li key={item.id} style={{ marginBottom: '4px' }}>
                <Button
                  {...(isActive ? { primary: true } : { secondary: true })}
                  onClick={() => onSectionChange(item.id)}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: '12px',
                    height: '40px',
                    padding: '0 12px',
                    backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                    borderColor: isActive ? '#2196f3' : 'transparent'
                  }}
                >
                  <Icon />
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {item.count > 0 && (
                    <Chip>
                      {item.count}
                    </Chip>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>

        {/* Storage Usage Section - Commented out as per original */}
        {/* 
        <Card style={{ marginTop: '32px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Storage</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown style={{ width: '12px', height: '12px' }} />
              ) : (
                <ChevronRight style={{ width: '12px', height: '12px' }} />
              )}
            </Button>
          </div>
          
          {isExpanded && (
            <>
              <div style={{ height: '8px', backgroundColor: '#e1e5e9', borderRadius: '4px', marginBottom: '8px' }}>
                <div style={{ width: '68%', height: '100%', backgroundColor: '#2196f3', borderRadius: '4px' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>6.8 GB of 10 GB used</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Documents</span>
                    <span>4.2 GB</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Images</span>
                    <span>1.8 GB</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Other</span>
                    <span>0.8 GB</span>
                  </div>
                </div>
              </div>
              <Button secondary style={{ width: '100%', marginTop: '8px', height: '32px' }}>
                Buy storage
              </Button>
            </>
          )}
        </Card>
        */}
      </nav>
    </aside>
  );
}
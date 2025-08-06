import { useState } from 'react';
import { Button } from '@dhis2/ui';
import { IconRefresh24, IconInfo24 } from '@dhis2/ui-icons';

interface DebugPanelProps {
  dhis2Files: any[];
  dhis2Folders: any[];
  allFiles: any[];
  filteredFiles: any[];
  currentFolderId: string | null;
  activeSection: string;
  onRefresh: () => void;
}

export function DebugPanel({
  dhis2Files,
  dhis2Folders,
  allFiles,
  filteredFiles,
  currentFolderId,
  activeSection,
  onRefresh
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      left: '20px', 
      backgroundColor: 'white', 
      border: '1px solid #e1e5e9', 
      borderRadius: '8px', 
      padding: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '300px',
      maxWidth: '500px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ color: '#666' }}>
          <IconInfo24 />
        </div>
        <span style={{ fontSize: '14px', fontWeight: '500' }}>Debug Panel</span>
        <Button
          secondary
          onClick={() => setIsOpen(!isOpen)}
          style={{ fontSize: '12px', padding: '4px 8px', marginLeft: 'auto' }}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </div>
      
      {isOpen && (
        <div style={{ fontSize: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Current State:</strong>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>DHIS2 Files:</span> {dhis2Files.length}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>DHIS2 Folders:</span> {dhis2Folders.length}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>All Files:</span> {allFiles.length}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>Filtered Files:</span> {filteredFiles.length}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>Current Folder:</span> {currentFolderId || 'Root'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>Active Section:</span> {activeSection}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>DHIS2 Folders:</strong>
          </div>
          {dhis2Folders.length > 0 ? (
            <div style={{ marginBottom: '8px', maxHeight: '100px', overflow: 'auto' }}>
              {dhis2Folders.map((folder, index) => (
                <div key={index} style={{ 
                  padding: '4px', 
                  backgroundColor: '#f8f9fa', 
                  marginBottom: '2px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  {folder.name} (ID: {folder.id})
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#999', marginBottom: '8px' }}>No folders found</div>
          )}
          
          <div style={{ marginBottom: '8px' }}>
            <strong>DHIS2 Files:</strong>
          </div>
          {dhis2Files.length > 0 ? (
            <div style={{ marginBottom: '8px', maxHeight: '100px', overflow: 'auto' }}>
              {dhis2Files.map((file, index) => (
                <div key={index} style={{ 
                  padding: '4px', 
                  backgroundColor: '#f8f9fa', 
                  marginBottom: '2px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  {file.name} (Type: {file.type})
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#999', marginBottom: '8px' }}>No files found</div>
          )}
          
          <Button
            secondary
            onClick={onRefresh}
            style={{ fontSize: '12px', padding: '4px 8px', width: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IconRefresh24 style={{ width: '12px', height: '12px' }} />
              Refresh Data
            </div>
          </Button>
        </div>
      )}
    </div>
  );
} 
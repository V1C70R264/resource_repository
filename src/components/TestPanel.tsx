import { useState } from 'react';
import { Button, Input } from '@dhis2/ui';
import { IconAdd24, IconClock24 } from '@dhis2/ui-icons';

interface TestPanelProps {
  onCreateFolder: (name: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function TestPanel({ onCreateFolder, onRefresh }: TestPanelProps) {
  const [folderName, setFolderName] = useState('Test Folder');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateFolder(folderName);
      setFolderName('Test Folder'); // Reset to default
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      backgroundColor: 'white', 
      border: '1px solid #e1e5e9', 
      borderRadius: '8px', 
      padding: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '250px'
    }}>
      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
        Test Panel
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <Input
          value={folderName}
          onChange={(e) => setFolderName(e.value)}
          placeholder="Folder name"
          style={{ marginBottom: '8px' }}
        />
        <Button
          primary
          onClick={handleCreateFolder}
          disabled={isCreating}
          style={{ width: '100%', marginBottom: '8px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconAdd24 style={{ width: '14px', height: '14px' }} />
            {isCreating ? 'Creating...' : 'Create Test Folder'}
          </div>
        </Button>
      </div>
      
      <Button
        secondary
        onClick={onRefresh}
        style={{ width: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '14px', height: '14px' }}>
            <IconClock24 />
          </div>
          Refresh Data
        </div>
      </Button>
    </div>
  );
} 
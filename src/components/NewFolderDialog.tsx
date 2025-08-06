import { useState } from "react";
import { Modal, Input, Button } from "@dhis2/ui";
import { IconFolder24 } from "@dhis2/ui-icons";

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFolder: (name: string) => void;
}

export function NewFolderDialog({ open, onOpenChange, onCreateFolder }: NewFolderDialogProps) {
  const [folderName, setFolderName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setFolderName("");
    onOpenChange(false);
  };

  return (
    <>
      {open && (
        <Modal
          onClose={() => onOpenChange(false)}
        >
          <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          <IconFolder24 />
          New folder
        </div>
        
        <div style={{ 
          color: '#666', 
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          Create a new folder to organize your files.
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
              <label htmlFor="folder-name" style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                display: 'block',
                marginBottom: '4px'
              }}>
                Folder name
              </label>
            </div>
            <Input
              placeholder="Untitled folder"
              value={folderName}
              onChange={(e) => setFolderName(e.value)}
            />
          </div>
          
          {/* Footer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            borderTop: '1px solid #e1e5e9',
            paddingTop: '16px'
          }}>
            <Button secondary onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              primary
              disabled={!folderName.trim()}
              onClick={() => {
                if (folderName.trim()) {
                  onCreateFolder(folderName.trim());
                  setFolderName("");
                  onOpenChange(false);
                }
              }}
            >
              Create
            </Button>
          </div>
        </form>
      </div>
        </Modal>
      )}
    </>
  );
}
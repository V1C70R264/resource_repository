import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DHIS2Button, DHIS2Input } from "@/components/ui/dhis2-components";
import { Folder } from "lucide-react";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-drive-blue" />
            New folder
          </DialogTitle>
          <DialogDescription>
            Create a new folder to organize your files.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="folder-name" className="text-sm font-medium">
                Folder name
              </label>
              <DHIS2Input
                placeholder="Untitled folder"
                value={folderName}
                onChange={(e) => setFolderName(e.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DHIS2Button secondary onClick={handleCancel}>
              Cancel
            </DHIS2Button>
            <DHIS2Button 
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
            </DHIS2Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
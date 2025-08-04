import { useState } from "react";
import { Tag, Globe, FileText, Edit3, Save, X, Plus } from "lucide-react";
import { DHIS2Button, DHIS2Input } from "@/components/ui/dhis2-components";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileMetadata } from "@/lib/types";

interface MetadataEditorProps {
  file: FileMetadata;
  isOpen: boolean;
  onClose: () => void;
  onSave: (metadata: FileMetadata) => void;
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

const documentTypes = [
  "Document",
  "Spreadsheet",
  "Presentation",
  "Image",
  "Video",
  "Audio",
  "Archive",
  "Code",
  "Data",
  "Report",
  "Manual",
  "Template",
  "Contract",
  "Invoice",
  "Receipt",
  "Certificate",
  "License",
  "Policy",
  "Procedure",
  "Guideline",
];

const suggestedTags = [
  "important",
  "urgent",
  "draft",
  "final",
  "review",
  "approved",
  "confidential",
  "public",
  "internal",
  "external",
  "project",
  "personal",
  "work",
  "home",
  "finance",
  "legal",
  "marketing",
  "sales",
  "hr",
  "it",
  "operations",
  "research",
  "design",
  "development",
  "testing",
  "production",
  "archive",
  "backup",
];

export function MetadataEditor({
  file,
  isOpen,
  onClose,
  onSave,
}: MetadataEditorProps) {
  const [metadata, setMetadata] = useState<FileMetadata>(file);
  const [newTag, setNewTag] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(metadata);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMetadata(file);
    setIsEditing(false);
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !metadata.tags.includes(cleanTag)) {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, cleanTag],
      });
    }
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(newTag);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Edit Metadata - {file.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Language</label>
                <Select
                  value={metadata.language || ""}
                  onValueChange={(value) =>
                    setMetadata({ ...metadata, language: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {lang.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Document Type</label>
                <Select
                  value={metadata.documentType || ""}
                  onValueChange={(value) =>
                    setMetadata({ ...metadata, documentType: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Version</label>
              <DHIS2Input
                value={metadata.version || ""}
                onChange={(e) =>
                  setMetadata({ ...metadata, version: e.value })
                }
                placeholder="e.g., 1.0, 2.1.3"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={metadata.description || ""}
                onChange={(e) =>
                  setMetadata({ ...metadata, description: e.target.value })
                }
                placeholder="Enter a description of this file..."
                rows={3}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </h3>

            <div className="space-y-3">
              {/* Current Tags */}
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1"
                  >
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {/* Add New Tag */}
              {isEditing && (
                <div className="flex gap-2">
                  <DHIS2Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.value)}
                    placeholder="Add a new tag..."
                    className="flex-1"
                  />
                  <DHIS2Button
                    onClick={() => addTag(newTag)}
                    disabled={!newTag.trim()}
                    small
                  >
                    <Plus className="w-4 h-4" />
                  </DHIS2Button>
                </div>
              )}

              {/* Suggested Tags */}
              {isEditing && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Suggested Tags
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {suggestedTags
                      .filter((tag) => !metadata.tags.includes(tag))
                      .slice(0, 12)
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Information (Read-only) */}
          <div className="space-y-4">
            <h3 className="font-medium">File Information</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-muted-foreground">File Name</label>
                <p className="font-medium">{metadata.name}</p>
              </div>
              <div>
                <label className="text-muted-foreground">File Type</label>
                <p className="font-medium">{metadata.fileType || "Unknown"}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Size</label>
                <p className="font-medium">{metadata.sizeFormatted || "Unknown"}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Modified</label>
                <p className="font-medium">{metadata.modified}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Owner</label>
                <p className="font-medium">{metadata.owner}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Created</label>
                <p className="font-medium">{metadata.created}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            {isEditing ? (
              <>
                <DHIS2Button secondary onClick={handleCancel}>
                  Cancel
                </DHIS2Button>
                <DHIS2Button primary onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </DHIS2Button>
              </>
            ) : (
              <>
                <DHIS2Button secondary onClick={onClose}>
                  Close
                </DHIS2Button>
                <DHIS2Button primary onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Metadata
                </DHIS2Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
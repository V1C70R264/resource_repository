import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Tag as DHIS2Tag,
  InputField,
  TextAreaField,
  SingleSelect,
  SingleSelectOption
} from "@dhis2/ui";
import { IconEdit24, IconCheckmark24, IconAdd24, IconCross24 } from "@dhis2/ui-icons";
import { FileMetadata } from "@/lib/types";
import { formatDate } from "@/lib/utils";

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

export function MetadataEditor({ file, isOpen, onClose, onSave }: MetadataEditorProps) {
  const [metadata, setMetadata] = useState<FileMetadata>(file);
  const [newTag, setNewTag] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [titleError, setTitleError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setMetadata(file);
      setNewTag("");
      setIsEditing(false);
      setTitleError(undefined);
    }
  }, [file, isOpen]);

  const handleSave = () => {
    if (!metadata.name || !metadata.name.trim()) {
      setTitleError('Title is required');
      return;
    }

    const updated: FileMetadata = {
      ...metadata,
      modified: new Date().toISOString(),
    };

    onSave(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMetadata(file);
    setIsEditing(false);
    setTitleError(undefined);
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !(metadata.tags || []).includes(cleanTag)) {
      setMetadata({
        ...metadata,
        tags: [...(metadata.tags || []), cleanTag],
      });
    }
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata({
      ...metadata,
      tags: (metadata.tags || []).filter((tag) => tag !== tagToRemove),
    });
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} large>
      <div style={{ padding: 20, maxWidth: 920, display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flex: '0 0 auto' }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 16 }}>
            <IconEdit24 />
            <span>Edit metadata — {file.name}</span>
          </div>
          {!isEditing && (
            <div>
              <Button primary small onClick={() => setIsEditing(true)}>
                <IconEdit24 /> Edit
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
          {/* Content layout: form on left (2/3), summary on right (1/3) */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            {/* Form column */}
            <div>
              {/* Title */}
              <InputField
                label="Title"
                value={metadata.name}
                onChange={({ value }) => { setMetadata({ ...metadata, name: value }); setTitleError(undefined); }}
                disabled={!isEditing}
                helpText="This is the display name shown in lists and search results."
                validationText={titleError}
                error={Boolean(titleError)}
              />

              {/* Language / Document type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--colors-grey700)", marginBottom: 4 }}>Language</div>
                  <SingleSelect
                    selected={metadata.language || ""}
                    onChange={({ selected }) => setMetadata({ ...metadata, language: selected })}
                    disabled={!isEditing}
                  >
                    <SingleSelectOption label="Select language" value="" />
                    {languages.map((lang) => (
                      <SingleSelectOption key={lang.code} label={lang.name} value={lang.code} />
                    ))}
                  </SingleSelect>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--colors-grey700)", marginBottom: 4 }}>Document type</div>
                  <SingleSelect
                    selected={metadata.documentType || ""}
                    onChange={({ selected }) => setMetadata({ ...metadata, documentType: selected })}
                    disabled={!isEditing}
                  >
                    <SingleSelectOption label="Select document type" value="" />
                    {documentTypes.map((type) => (
                      <SingleSelectOption key={type} label={type} value={type} />
                    ))}
                  </SingleSelect>
                </div>
              </div>

              {/* Version */}
              <div style={{ marginTop: 12 }}>
                <InputField
                  label="Version"
                  value={metadata.version || ""}
                  onChange={({ value }) => setMetadata({ ...metadata, version: value })}
                  placeholder="e.g., 1.0, 2.1.3"
                  disabled={!isEditing}
                />
              </div>

              {/* Description */}
              <div style={{ marginTop: 12 }}>
                <TextAreaField
                  label="Description"
                  value={metadata.description || ""}
                  onChange={({ value }) => setMetadata({ ...metadata, description: value })}
                  rows={4}
                  placeholder="Enter a description of this file..."
                  disabled={!isEditing}
                />
              </div>

              {/* Tags */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 600 }}>
                  <span>Tags</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(metadata.tags || []).map((tag) => (
                    <div key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <DHIS2Tag>{tag}</DHIS2Tag>
                      {isEditing && (
                        <Button small secondary onClick={() => removeTag(tag)}>
                          <IconCross24 />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <InputField
                      label="Add tag"
                      value={newTag}
                      onChange={({ value }) => setNewTag(value)}
                      placeholder="Type a tag and click add"
                    />
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <Button small primary onClick={() => addTag(newTag)} disabled={!newTag.trim()}>
                        <IconAdd24 />
                      </Button>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: "var(--colors-grey700)", marginBottom: 6 }}>
                      Suggested tags
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {suggestedTags
                        .filter((t) => !(metadata.tags || []).includes(t))
                        .slice(0, 12)
                        .map((t) => (
                          <Button key={t} small secondary onClick={() => addTag(t)}>
                            {t}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary column */}
            <div style={{ borderLeft: '1px solid var(--colors-grey300)', paddingLeft: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, fontSize: 14 }}>
                <div>
                  <div style={{ color: "var(--colors-grey700)" }}>File name</div>
                  <div style={{ fontWeight: 500 }}>{metadata.name}</div>
                </div>
                <div>
                  <div style={{ color: "var(--colors-grey700)" }}>File type</div>
                  <div style={{ fontWeight: 500 }}>{metadata.fileType || "Unknown"}</div>
                </div>
                <div>
                  <div style={{ color: "var(--colors-grey700)" }}>Size</div>
                  <div style={{ fontWeight: 500 }}>{metadata.sizeFormatted || "Unknown"}</div>
                </div>
                <div>
                  <div style={{ color: "var(--colors-grey700)" }}>Modified</div>
                  <div style={{ fontWeight: 500 }}>{formatDate(metadata.modified)}</div>
                </div>
                <div>
                  <div style={{ color: "var(--colors-grey700)" }}>Owner</div>
                  <div style={{ fontWeight: 500 }}>{metadata.owner}</div>
                </div>
                <div>
                  <div style={{ color: "var(--colors-grey700)" }}>Created</div>
                  <div style={{ fontWeight: 500 }}>{formatDate(metadata.created)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom action bar: shows only while editing */}
        {isEditing && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, borderTop: '1px solid var(--colors-grey300)', paddingTop: 12, flex: '0 0 auto' }}>
            <Button secondary onClick={handleCancel}>Cancel</Button>
            <Button primary onClick={handleSave}>
              <IconCheckmark24 /> Save changes
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
} 
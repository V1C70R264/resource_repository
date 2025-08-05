export interface FileMetadata {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  mimeType?: string;
  size?: number;
  sizeFormatted?: string;
  modified: string;
  created: string;
  owner: string;
  starred: boolean;
  shared: boolean;
  thumbnail?: string;
  tags: string[];
  language?: string;
  documentType?: string;
  description?: string;
  version?: string;
  parentId?: string;
  path: string;
}

export interface FileItem extends FileMetadata {
  parentId?: string;
}



export interface AuditLog {
  id: string;
  fileId: string;
  fileName: string;
  action: 'view' | 'edit' | 'download' | 'share' | 'delete' | 'create' | 'move' | 'copy';
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'guest';
  avatar?: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  fileId: string;
  userId: string;
  type: 'read' | 'write' | 'admin';
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface SearchFilters {
  query: string;
  fileTypes: string[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  owners: string[];
  starred: boolean;
  shared: boolean;
}

export interface PreviewData {
  fileId: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  url: string;
  thumbnail?: string;
  canEdit: boolean;
} 
import { useState, useEffect } from "react";
import { X, Download, Share, Edit, ZoomIn, ZoomOut, RotateCw, FileText, Image, Video, Music, Archive } from "lucide-react";
import { 
  Modal, 
  Button, 
  Tag, 
  TabBar, 
  Tab, 
  NoticeBox,
  CircularLoader
} from '@dhis2/ui';
import { IconCross24, IconDownload24, IconShare24, IconEdit24 } from '@dhis2/ui-icons';
import { PreviewData } from "@/lib/types";
import { getAuthHeaders } from "@/config/dhis2";

interface FilePreviewProps {
  file: PreviewData;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
  onEdit: () => void;
}

export function FilePreview({
  file,
  isOpen,
  onClose,
  onDownload,
  onShare,
  onEdit,
}: FilePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [activeTab, setActiveTab] = useState("preview");
  const [isLoading, setIsLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string>(file.url);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Reset state when file or tab changes
  useEffect(() => {
    setIsLoading(true);
    setPreviewError(null);
    setZoom(100);
    setRotation(0);
    setResolvedUrl(file.url);
  }, [file, activeTab]);

  // Prefetch secured URLs with auth and convert to blob URL for media
  useEffect(() => {
    let cancelled = false;
    const needsFetch = /^https?:/i.test(file.url) && !file.url.startsWith('data:');
    const isOfficeDoc = isWord || isExcel;
    const isMedia = file.mimeType.startsWith('video/') || file.mimeType.startsWith('audio/') || file.mimeType === 'application/pdf' || file.mimeType.startsWith('image/');

    if (!needsFetch || (!isMedia && !isText)) {
      setResolvedUrl(file.url);
      setIsLoading(false);
      return () => {};
    }

    // For Office docs we don't prefetch; Office viewer needs the original URL
    if (isOfficeDoc) {
      setResolvedUrl(file.url);
      setIsLoading(false);
      return () => {};
    }

    (async () => {
      try {
        const headers = getAuthHeaders();
        delete (headers as any)['Content-Type'];
        const resp = await fetch(file.url, { headers });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setObjectUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
        setResolvedUrl(url);
        setIsLoading(false);
      } catch (e) {
        if (!cancelled) {
          setResolvedUrl(file.url);
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      setResolvedUrl(file.url);
      setIsLoading(false);
      setObjectUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    };
  }, [file]);

  // Enhanced file type detection for in-app preview
  const isImage = file.mimeType.startsWith("image/");
  const isPDF = file.mimeType === "application/pdf";
  const isWord = file.mimeType.includes("word") || 
                 file.mimeType.includes("docx") || 
                 file.mimeType.includes("doc") ||
                 file.fileType?.toLowerCase().includes("word") ||
                 file.fileType?.toLowerCase().includes("document");
  const isExcel = file.mimeType.includes("excel") || 
                  file.mimeType.includes("xlsx") || 
                  file.mimeType.includes("xls") ||
                  file.fileType?.toLowerCase().includes("excel") ||
                  file.fileType?.toLowerCase().includes("spreadsheet");
  const isVideo = file.mimeType.startsWith("video/");
  const isAudio = file.mimeType.startsWith("audio/");
  const isText = file.mimeType.startsWith("text/") || 
                 file.mimeType === "application/json" ||
                 file.mimeType === "application/xml";

  const getFileIcon = () => {
    if (isImage) return Image;
    if (isVideo) return Video;
    if (isAudio) return Music;
    if (isWord || isExcel) return FileText;
    return FileText;
  };

  const FileIcon = getFileIcon();

  const handleZoomIn = () => setZoom(Math.min(zoom + 25, 200));
  const handleZoomOut = () => setZoom(Math.max(zoom - 25, 25));
  const handleRotate = () => setRotation((rotation + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const renderPreview = () => {
    if (!file.url && !resolvedUrl) {
      return (
        <NoticeBox error title="Preview Error">
          No previewable URL was provided.
        </NoticeBox>
      );
    }

    if (isImage) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          overflow: 'hidden',
          minHeight: '400px',
          position: 'relative'
        }}>
          <img
            src={resolvedUrl}
            alt={file.fileName}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setPreviewError('Failed to load image');
            }}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div style={{ width: '100%', height: '100%', minHeight: '75vh' }}>
          <iframe
            src={`${resolvedUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: '1px solid #e1e5e9',
              borderRadius: '4px'
            }}
            title={file.fileName}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setPreviewError('Failed to load PDF');
            }}
          />
        </div>
      );
    }

    if (isWord || isExcel) {
      const isHttpUrl = /^(https?:)/i.test(file.url);
      if (!isHttpUrl) {
        return (
          <NoticeBox warning title="Preview not available">
            This document requires download to view because it is not accessible via a public URL.
          </NoticeBox>
        );
      }
      const officeOnlineUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`;
      return (
        <div style={{ width: '100%', height: '100%', minHeight: '600px' }}>
          <iframe
            src={officeOnlineUrl}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: '1px solid #e1e5e9',
              borderRadius: '4px'
            }}
            title={file.fileName}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setPreviewError('Failed to load document');
            }}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '480px'
        }}>
          <video
            controls
            playsInline
            preload="metadata"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoom / 100})`,
              transition: "transform 0.2s ease",
            }}
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
            }}
          >
            <source src={resolvedUrl} type={file.mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '32px',
          minHeight: '200px'
        }}>
          <audio 
            controls 
            preload="metadata"
            style={{ width: '100%', maxWidth: '400px' }}
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setPreviewError('Failed to load audio');
            }}
          >
            <source src={resolvedUrl} type={file.mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if (isText) {
      return (
        <div style={{ width: '100%', height: '100%', minHeight: '600px' }}>
          <iframe
            src={resolvedUrl}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: '1px solid #e1e5e9',
              borderRadius: '4px'
            }}
            title={file.fileName}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setPreviewError('Failed to load text file');
            }}
          />
        </div>
      );
    }

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '32px',
        textAlign: 'center',
        minHeight: '400px'
      }}>
        <FileIcon style={{ width: '64px', height: '64px', color: '#6c757d', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>{file.fileName}</h3>
        <p style={{ color: '#6c757d', marginBottom: '16px' }}>
          In-app preview not available for this file type
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button primary onClick={onDownload}>
            <IconDownload24 />
            Download to View
          </Button>
        </div>
      </div>
    );
  };

  const renderErrorNotice = () => {
    if (!previewError) return null;
    return (
      <NoticeBox error title="Preview Error">
        {previewError}
        <div style={{ marginTop: '12px' }}>
          <Button secondary onClick={onDownload}>
            <IconDownload24 />
            Download Instead
          </Button>
        </div>
      </NoticeBox>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} large>
      <div style={{ 
        padding: '24px', 
        maxWidth: '1200px', 
        maxHeight: '90vh', 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid #e1e5e9',
          paddingBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileIcon style={{ width: '20px', height: '20px' }} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{file.fileName}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                <Tag>{file.fileType}</Tag>
                <span>•</span>
                <span>{file.mimeType}</span>
                {(isWord || isExcel || isPDF) && (
                  <>
                    <span>•</span>
                    <span style={{ color: '#28a745', fontWeight: '500' }}>In-App Preview</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(isImage || isVideo) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #e1e5e9', borderRadius: '8px', padding: '4px' }}>
                <Button
                  secondary
                  small
                  onClick={handleZoomOut}
                  disabled={zoom <= 25}
                  style={{ height: '32px', width: '32px', padding: 0 }}
                >
                  <ZoomOut style={{ width: '16px', height: '16px' }} />
                </Button>
                <span style={{ fontSize: '14px', padding: '0 8px' }}>{zoom}%</span>
                <Button
                  secondary
                  small
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  style={{ height: '32px', width: '32px', padding: 0 }}
                >
                  <ZoomIn style={{ width: '16px', height: '16px' }} />
                </Button>
              </div>
            )}

            {isImage && (
              <Button
                secondary
                small
                onClick={handleRotate}
                style={{ height: '32px', width: '32px', padding: 0 }}
              >
                <RotateCw style={{ width: '16px', height: '16px' }} />
              </Button>
            )}

            {(isImage || isVideo) && (
              <Button
                secondary
                small
                onClick={handleReset}
                style={{ height: '32px', padding: '0 8px' }}
              >
                Reset
              </Button>
            )}

            <Button secondary small onClick={onDownload}>
              <IconDownload24 />
            </Button>
            <Button secondary small onClick={onShare}>
              <IconShare24 />
            </Button>
            {file.canEdit && (
              <Button secondary small onClick={onEdit}>
                <IconEdit24 />
              </Button>
            )}
            <Button secondary small onClick={onClose}>
              <IconCross24 />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div data-test="file-preview-tabs">
            <TabBar>
              <Tab 
                selected={activeTab === "preview"} 
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </Tab>
              <Tab 
                selected={activeTab === "details"} 
                onClick={() => setActiveTab("details")}
              >
                Details
              </Tab>
            </TabBar>

            {activeTab === "preview" && (
              <div style={{ position: 'relative', maxHeight: '70vh', overflow: 'auto', padding: '24px' }}>
                {renderErrorNotice()}
                {/* Spacer below error to avoid overlap with content */}
                {previewError && <div style={{ height: 12 }} />}
                {renderPreview()}
                {isLoading && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CircularLoader small />
                      <span style={{ marginLeft: '12px' }}>Loading preview...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6c757d' }}>File Name</label>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>{file.fileName}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6c757d' }}>File Type</label>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>{file.fileType}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6c757d' }}>MIME Type</label>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>{file.mimeType}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6c757d' }}>File ID</label>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0', fontFamily: 'monospace' }}>{file.fileId}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6c757d' }}>Preview Type</label>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>
                      {(isWord || isExcel || isPDF) ? 'In-App Preview' : 'Download Required'}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6c757d' }}>Edit Permissions</label>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>
                      {file.canEdit ? 'Can Edit' : 'View Only'}
                    </p>
                  </div>
                </div>

                {file.thumbnail && (
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6c757d' }}>Thumbnail</label>
                    <img
                      src={file.thumbnail}
                      alt="Thumbnail"
                      style={{ 
                        marginTop: '8px', 
                        maxWidth: '320px', 
                        borderRadius: '4px', 
                        border: '1px solid #e1e5e9' 
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
} 
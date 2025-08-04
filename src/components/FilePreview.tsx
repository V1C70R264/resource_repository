import { useState, useEffect } from "react";
import { X, Download, Share, Edit, ZoomIn, ZoomOut, RotateCw, FileText, Image, Video, Music, Archive } from "lucide-react";
import { DHIS2Button } from "@/components/ui/dhis2-components";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PreviewData } from "@/lib/types";

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

  const isImage = file.mimeType.startsWith("image/");
  const isPDF = file.mimeType === "application/pdf";
  const isVideo = file.mimeType.startsWith("video/");
  const isAudio = file.mimeType.startsWith("audio/");
  const isText = file.mimeType.startsWith("text/") || 
                 file.mimeType === "application/json" ||
                 file.mimeType === "application/xml";
  const isDocument = file.mimeType.includes("word") || 
                     file.mimeType.includes("excel") ||
                     file.mimeType.includes("powerpoint") ||
                     file.mimeType.includes("document");

  const getFileIcon = () => {
    if (isImage) return Image;
    if (isVideo) return Video;
    if (isAudio) return Music;
    if (isDocument) return FileText;
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
    if (isImage) {
      return (
        <div className="flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
          <img
            src={file.url}
            alt={file.fileName}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
            }}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="w-full h-full">
          <iframe
            src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-0"
            title={file.fileName}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex items-center justify-center">
          <video
            controls
            className="max-w-full max-h-full"
            style={{
              transform: `scale(${zoom / 100})`,
              transition: "transform 0.2s ease",
            }}
          >
            <source src={file.url} type={file.mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="flex items-center justify-center p-8">
          <audio controls className="w-full max-w-md">
            <source src={file.url} type={file.mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if (isText) {
      return (
        <div className="w-full h-full">
          <iframe
            src={file.url}
            className="w-full h-full border-0"
            title={file.fileName}
          />
        </div>
      );
    }

    // Default preview for unsupported files
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileIcon className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">{file.fileName}</h3>
        <p className="text-muted-foreground mb-4">
          Preview not available for this file type
        </p>
        <div className="flex gap-2">
          <DHIS2Button secondary onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </DHIS2Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="w-5 h-5" />
              <div>
                <DialogTitle className="text-left">{file.fileName}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{file.fileType}</Badge>
                  <span>•</span>
                  <span>{file.mimeType}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              {(isImage || isVideo) && (
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <DHIS2Button
                    secondary
                    small
                    onClick={handleZoomOut}
                    disabled={zoom <= 25}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </DHIS2Button>
                  <span className="text-sm px-2">{zoom}%</span>
                  <DHIS2Button
                    secondary
                    small
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </DHIS2Button>
                </div>
              )}

              {/* Rotation Control */}
              {isImage && (
                <DHIS2Button
                  secondary
                  small
                  onClick={handleRotate}
                  className="h-8 w-8 p-0"
                >
                  <RotateCw className="w-4 h-4" />
                </DHIS2Button>
              )}

              {/* Reset */}
              {(isImage || isVideo) && (
                <DHIS2Button
                  secondary
                  small
                  onClick={handleReset}
                  className="h-8 w-8 p-0"
                >
                  Reset
                </DHIS2Button>
              )}

              {/* Action Buttons */}
              <DHIS2Button secondary small onClick={onDownload}>
                <Download className="w-4 h-4" />
              </DHIS2Button>
              <DHIS2Button secondary small onClick={onShare}>
                <Share className="w-4 h-4" />
              </DHIS2Button>
              {file.canEdit && (
                <DHIS2Button secondary small onClick={onEdit}>
                  <Edit className="w-4 h-4" />
                </DHIS2Button>
              )}
              <DHIS2Button secondary small onClick={onClose}>
                <X className="w-4 h-4" />
              </DHIS2Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="px-6 py-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="h-full p-6">
              <div className="h-full overflow-auto">
                {renderPreview()}
              </div>
            </TabsContent>

            <TabsContent value="details" className="h-full p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">File Name</label>
                    <p className="text-sm">{file.fileName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">File Type</label>
                    <p className="text-sm">{file.fileType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">MIME Type</label>
                    <p className="text-sm">{file.mimeType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">File ID</label>
                    <p className="text-sm font-mono">{file.fileId}</p>
                  </div>
                </div>

                {file.thumbnail && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Thumbnail</label>
                    <img
                      src={file.thumbnail}
                      alt="Thumbnail"
                      className="mt-2 max-w-xs rounded border"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
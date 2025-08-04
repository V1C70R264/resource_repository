import { useState } from "react";
import { Clock, Eye, Edit, Download, Share, Trash2, Plus, Move, Copy, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { DHIS2Input } from "@/components/ui/dhis2-components";
import { AuditLog } from "@/lib/types";
import { format } from "date-fns";

interface AuditLogProps {
  logs: AuditLog[];
  isOpen: boolean;
  onClose: () => void;
}

const actionIcons = {
  view: Eye,
  edit: Edit,
  download: Download,
  share: Share,
  delete: Trash2,
  create: Plus,
  move: Move,
  copy: Copy,
};

const actionColors = {
  view: "bg-blue-100 text-blue-800",
  edit: "bg-yellow-100 text-yellow-800",
  download: "bg-green-100 text-green-800",
  share: "bg-purple-100 text-purple-800",
  delete: "bg-red-100 text-red-800",
  create: "bg-green-100 text-green-800",
  move: "bg-orange-100 text-orange-800",
  copy: "bg-indigo-100 text-indigo-800",
};

export function AuditLogDialog({ logs, isOpen, onClose }: AuditLogProps) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "all" || log.action === filter;
    const matchesSearch = log.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Audit Log
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="download">Download</SelectItem>
                  <SelectItem value="share">Share</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="move">Move</SelectItem>
                  <SelectItem value="copy">Copy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DHIS2Input
              placeholder="Search files or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.value)}
              className="max-w-xs"
            />

            <Badge variant="secondary">
              {filteredLogs.length} entries
            </Badge>
          </div>

          {/* Logs Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-2">Action</div>
                <div className="col-span-4">File</div>
                <div className="col-span-2">User</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Details</div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No audit logs found
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const ActionIcon = actionIcons[log.action];
                  return (
                    <div
                      key={log.id}
                      className="px-4 py-3 border-b hover:bg-muted/30 transition-colors"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <ActionIcon className="w-4 h-4" />
                            <Badge
                              variant="secondary"
                              className={actionColors[log.action]}
                            >
                              {log.action}
                            </Badge>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <div className="font-medium truncate">{log.fileName}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm">{log.userName}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm text-muted-foreground truncate">
                            {log.details || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filteredLogs.length} of {logs.length} entries
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>View</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Edit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Download</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
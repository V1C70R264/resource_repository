import { useState } from "react";
import {
  Modal,
  Button,
  InputField,
  SingleSelect,
  SingleSelectOption,
  Tag as DHIS2Tag,
} from "@dhis2/ui";
import { IconClock24, IconDownload24 } from "@dhis2/ui-icons";
import { AuditLog } from "@/lib/types";
import { dataStoreAPI } from "@/lib/dhis2-api";
import { formatDateTime } from "@/lib/utils";

interface AuditLogProps {
  logs: AuditLog[];
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDialog({ logs, isOpen, onClose }: AuditLogProps) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "all" || log.action === filter;
    const matchesSearch = log.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isOpen) return null;

  const escapeCsv = (value: string) => String(value).replace(/"/g, '""');
  const toCsv = (data: AuditLog[]) => {
    const headers = [
      'id','action','fileId','fileName','userId','userName','timestamp','details'
    ];
    const rows = data.map(l => [
      l.id,
      l.action,
      l.fileId,
      escapeCsv(l.fileName),
      l.userId,
      escapeCsv(l.userName),
      formatDateTime(l.timestamp),
      escapeCsv(l.details || '')
    ]);
    return [headers, ...rows]
      .map(cols => cols.map(c => `"${String(c)}"`).join(','))
      .join('\n');
  };

  const downloadCsv = (csv: string, name: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportFilteredCsv = () => {
    downloadCsv(toCsv(filteredLogs), `audit_logs_filtered_${Date.now()}.csv`);
  };

  const exportAllCsv = async () => {
    try {
      const all = await dataStoreAPI.getAllAuditLogs();
      downloadCsv(toCsv(all as any), `audit_logs_all_${Date.now()}.csv`);
    } catch (e) {
      // optional: show notice if needed
    }
  };

  return (
    <Modal onClose={onClose} large>
      <div style={{ padding: 20, maxWidth: 1040, display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <IconClock24 />
            <span>Audit log</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button secondary small onClick={exportFilteredCsv}>
              <IconDownload24 /> Export filtered
            </Button>
            <Button secondary small onClick={exportAllCsv}>
              <IconDownload24 /> Export all
            </Button>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: '1 1 auto', overflowY: 'auto' }}>
          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <SingleSelect selected={filter} onChange={({ selected }) => setFilter(selected)}>
              <SingleSelectOption label="All actions" value="all" />
              <SingleSelectOption label="View" value="view" />
              <SingleSelectOption label="Edit" value="edit" />
              <SingleSelectOption label="Download" value="download" />
              <SingleSelectOption label="Share" value="share" />
              <SingleSelectOption label="Delete" value="delete" />
              <SingleSelectOption label="Create" value="create" />
              <SingleSelectOption label="Move" value="move" />
              <SingleSelectOption label="Copy" value="copy" />
            </SingleSelect>

            <div style={{ flex: 1, minWidth: 240 }}>
              <InputField
                label=""
                value={searchQuery}
                onChange={({ value }) => setSearchQuery(value)}
                placeholder="Search files or users..."
                name="audit-search"
              />
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <DHIS2Tag>{filteredLogs.length} entries</DHIS2Tag>
            </div>
          </div>

          {/* Table header */}
          <div style={{ border: '1px solid var(--colors-grey300)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: 'var(--colors-grey100)', padding: '8px 12px', borderBottom: '1px solid var(--colors-grey300)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr 1.5fr 2fr', gap: 12, fontSize: 12, color: 'var(--colors-grey700)', fontWeight: 600 }}>
                <div>Action</div>
                <div>File</div>
                <div>User</div>
                <div>Date</div>
                <div>Details</div>
              </div>
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {filteredLogs.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--colors-grey700)' }}>No audit logs found</div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} style={{ padding: '10px 12px', borderBottom: '1px solid var(--colors-grey200)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr 1.5fr 2fr', gap: 12, alignItems: 'center' }}>
                      <div>
                        <DHIS2Tag>{log.action}</DHIS2Tag>
                      </div>
                      <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.fileName}</div>
                      <div style={{ fontSize: 14 }}>{log.userName}</div>
                      <div style={{ fontSize: 12, color: 'var(--colors-grey700)' }}>{formatDateTime(log.timestamp)}</div>
                      <div style={{ fontSize: 12, color: 'var(--colors-grey700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.details || '-'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--colors-grey700)', fontSize: 12 }}>
            <div>Showing {filteredLogs.length} of {logs.length} entries</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <Button secondary onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
} 
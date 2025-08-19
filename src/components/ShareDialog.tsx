import { useState, useMemo, useEffect } from "react";
import { Modal, Button, InputField, SingleSelect, SingleSelectOption, Tag, CircularLoader } from "@dhis2/ui";
import { IconShare24, IconAdd24, IconCross24 } from "@dhis2/ui-icons";
import { Permission, User, OrgUnit } from "@/lib/types";
import { useDHIS2Alerts } from "./DHIS2Alerts";
import { useDHIS2DataStore } from "@/hooks/useDHIS2DataStore";
import { dataStoreAPI } from "@/lib/dhis2-api";

interface ShareDialogProps {
  fileId: string;
  fileIds?: string[]; // optional multi-share
  fileName: string;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onShare: (permissions: Permission[]) => void;
}

export function ShareDialog({ fileId, fileIds, fileName, users: usersProp, isOpen, onClose, onShare }: ShareDialogProps) {
  if (!isOpen) return null;

  const alerts = useDHIS2Alerts();
  const { refreshUsers } = useDHIS2DataStore();

  type TargetType = 'user' | 'group' | 'role' | 'orgUnit';

  const [users, setUsers] = useState<User[]>(usersProp || []);
  const [usersLoading, setUsersLoading] = useState(false);

  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [orgUnitsLoading, setOrgUnitsLoading] = useState(false);

  useEffect(() => {
    const fetchUsersIfNeeded = async () => {
      if (!usersProp || usersProp.length === 0) {
        try {
          setUsersLoading(true);
          await refreshUsers();
        } catch (e) {
          alerts.critical('Failed to fetch users');
        } finally {
          setUsersLoading(false);
        }
      }
    };
    fetchUsersIfNeeded();
  }, [usersProp, refreshUsers]);

  useEffect(() => {
    const fetchOrgUnits = async () => {
      try {
        setOrgUnitsLoading(true);
        const ous = await dataStoreAPI.getAllOrgUnits();
        setOrgUnits(ous.map((o: any) => ({ id: o.id, name: o.displayName || o.name, displayName: o.displayName, level: o.level, parentId: o.parent?.id })));
      } catch (e) {
        alerts.critical('Failed to fetch organisation units');
      } finally {
        setOrgUnitsLoading(false);
      }
    };
    fetchOrgUnits();
  }, []);

  const [targetType, setTargetType] = useState<TargetType>('user');
  const [targetId, setTargetId] = useState<string>('');
  const [permissionType, setPermissionType] = useState<'read' | 'write' | 'admin'>('read');
  const [expiry, setExpiry] = useState<string>('');
  const [pending, setPending] = useState<Array<{ targetType: TargetType; targetId: string; permissionType: 'read'|'write'|'admin'; expiry?: string }>>([]);

  const multiple = (fileIds && fileIds.length > 1) ? true : false;
  const targetFileIds = (fileIds && fileIds.length > 0) ? fileIds : [fileId];

  const link = useMemo(() => {
    if (multiple) return '';
    const base = `${window.location.origin}${window.location.pathname}`;
    const url = new URL(base);
    url.searchParams.set('fileId', fileId);
    return url.toString();
  }, [fileId, multiple]);

  const addRecipient = () => {
    if (!targetId) return;
    setPending(prev => [...prev, { targetType, targetId, permissionType, expiry: expiry || undefined }]);
    setTargetId('');
    setPermissionType('read');
    setExpiry('');
  };

  const removeRecipient = (idx: number) => {
    setPending(prev => prev.filter((_, i) => i !== idx));
  };

  const handleShare = () => {
    const entriesSeed = pending.length ? pending : (targetId ? [{ targetType, targetId, permissionType, expiry: expiry || undefined }] : []);
    if (entriesSeed.length === 0) return;
    const now = new Date().toISOString();
    const entries: Permission[] = [];
    for (const fid of targetFileIds) {
      for (const entry of entriesSeed) {
        entries.push({
          id: `perm_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
          fileId: fid,
          userId: entry.targetType === 'user' ? entry.targetId : '',
          type: entry.permissionType,
          grantedBy: 'Current User',
          grantedAt: now,
          expiresAt: entry.expiry,
          targetType: entry.targetType,
          targetId: entry.targetId,
        });
      }
    }
    onShare(entries);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      alerts.success('Link copied to clipboard');
    } catch {
      alerts.critical('Failed to copy link');
    }
  };

  const composeEmail = () => {
    const ids = [
      ...pending.filter(p => p.targetType === 'user').map(p => p.targetId),
      ...(targetType === 'user' && targetId ? [targetId] : [])
    ];
    const emails = ids
      .map(id => users.find(u => u.id === id)?.email)
      .filter((e): e is string => !!e);

    const subject = encodeURIComponent(`Shared resource: ${fileName}`);
    const body = encodeURIComponent(`Hi,\n\nI am sharing a resource with you in DHIS2.\n\nTitle: ${fileName}\nLink: ${link}\n\nAccess is granted based on your permissions.`);

    const to = emails.slice(0, 1).join(',');
    const cc = emails.slice(1).join(',');
    const mailto = `mailto:${to}?${cc ? `cc=${encodeURIComponent(cc)}&` : ''}subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };

  return (
    <Modal onClose={onClose} large>
      <div style={{ padding: 20, maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <IconShare24 />
            <span>Share — {multiple ? `${targetFileIds.length} items` : fileName}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!multiple && <Button secondary small onClick={copyLink}>Copy link</Button>}
            {!multiple && <Button secondary small onClick={composeEmail}>Compose email</Button>}
          </div>
        </div>

        {/* Link field */}
        {!multiple && (
          <InputField label="Link" value={link} onChange={() => {}} helpText="Recipients must have permission to access." />
        )}

        {/* Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--colors-grey700)', marginBottom: 4 }}>Target type</div>
            <SingleSelect selected={targetType} onChange={({ selected }) => setTargetType(selected as TargetType)}>
              <SingleSelectOption label="User" value="user" />
              <SingleSelectOption label="Group" value="group" />
              <SingleSelectOption label="Role" value="role" />
              <SingleSelectOption label="Org unit" value="orgUnit" />
            </SingleSelect>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            {targetType === 'user' ? (
              <div>
                <div style={{ fontSize: 12, color: 'var(--colors-grey700)', marginBottom: 4 }}>User</div>
                {usersLoading ? (
                  <div style={{ padding: 8 }}><CircularLoader small /></div>
                ) : (
                  <SingleSelect selected={targetId} onChange={({ selected }) => setTargetId(selected)}>
                    <SingleSelectOption label="Select user" value="" />
                    {users.map(u => (
                      <SingleSelectOption key={u.id} label={u.name} value={u.id} />
                    ))}
                  </SingleSelect>
                )}
              </div>
            ) : targetType === 'orgUnit' ? (
              <div>
                <div style={{ fontSize: 12, color: 'var(--colors-grey700)', marginBottom: 4 }}>Organisation unit</div>
                {orgUnitsLoading ? (
                  <div style={{ padding: 8 }}><CircularLoader small /></div>
                ) : (
                  <SingleSelect selected={targetId} onChange={({ selected }) => setTargetId(selected)}>
                    <SingleSelectOption label="Select org unit" value="" />
                    {orgUnits.map(ou => (
                      <SingleSelectOption key={ou.id} label={ou.name} value={ou.id} />
                    ))}
                  </SingleSelect>
                )}
              </div>
            ) : (
              <InputField label={`Target ID (${targetType})`} value={targetId} onChange={({ value }) => setTargetId(value)} placeholder={`Enter ${targetType} id`} />
            )}
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--colors-grey700)', marginBottom: 4 }}>Permission</div>
            <SingleSelect selected={permissionType} onChange={({ selected }) => setPermissionType(selected as any)}>
              <SingleSelectOption label="Can view" value="read" />
              <SingleSelectOption label="Can edit" value="write" />
              <SingleSelectOption label="Full access" value="admin" />
            </SingleSelect>
          </div>

          <div>
            <InputField label="Expires (optional)" value={expiry} onChange={({ value }) => setExpiry(value)} placeholder="YYYY-MM-DD" />
          </div>
        </div>

        {/* Pending recipients */}
        {pending.length > 0 && (
          <div style={{ border: '1px solid var(--colors-grey300)', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Recipients</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {pending.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--colors-grey200)', borderRadius: 6, padding: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag>{p.targetType}</Tag>
                    <div style={{ fontWeight: 600 }}>{p.targetId}</div>
                    <div><Tag>{p.permissionType}</Tag></div>
                    {p.expiry && <div style={{ fontSize: 12, color: 'var(--colors-grey700)' }}>expires {p.expiry}</div>}
                  </div>
                  <Button small secondary onClick={() => removeRecipient(idx)}>
                    <IconCross24 />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button secondary onClick={addRecipient} disabled={!targetId}><IconAdd24 /> Add</Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button secondary onClick={onClose}>Cancel</Button>
            <Button primary onClick={handleShare} disabled={!targetId && pending.length === 0}>Share</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

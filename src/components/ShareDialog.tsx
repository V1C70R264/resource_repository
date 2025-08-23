import { useState, useMemo, useEffect } from "react";
import { Modal, Button, InputField, SingleSelect, SingleSelectOption } from "@dhis2/ui";
import { IconCross24, IconUserGroup24} from "@dhis2/ui-icons";
import { Permission, User } from "@/lib/types";
import { useDHIS2Alerts } from "./DHIS2Alerts";
import { useDHIS2DataStore } from "@/hooks/useDHIS2DataStore";

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

  const [users, setUsers] = useState<User[]>(usersProp || []);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [permissionType, setPermissionType] = useState<'read' | 'write'>('read');
  const [pending, setPending] = useState<Array<{ userId: string; permissionType: 'read'|'write' }>>([]);

  const targetFileIds = (fileIds && fileIds.length > 0) ? fileIds : [fileId];

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

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

  const addRecipient = () => {
    if (!selectedUser) return;
    setPending(prev => [...prev, { userId: selectedUser, permissionType }]);
    setSelectedUser('');
    setPermissionType('read');
    setSearchQuery('');
  };

  const removeRecipient = (idx: number) => {
    setPending(prev => prev.filter((_, i) => i !== idx));
  };

  const handleShare = () => {
    if (pending.length === 0) return;
    const now = new Date().toISOString();
    const entries: Permission[] = [];
    for (const fid of targetFileIds) {
      for (const entry of pending) {
        entries.push({
          id: `perm_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
          fileId: fid,
          userId: entry.userId,
          type: entry.permissionType,
          grantedBy: 'Current User',
          grantedAt: now,
          targetType: 'user',
          targetId: entry.userId,
        });
      }
    }
    onShare(entries);
  };

  return (
    <Modal onClose={onClose} large>
      <div style={{ padding: 0, maxWidth: 700 }}>
        {/* Header with close button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid var(--colors-grey300)'
        }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--colors-grey900)' }}>
            Sharing and access: {fileName}
          </h2>
          <Button 
            icon={<IconCross24 />} 
            onClick={onClose}
            secondary
            small
          />
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Give Access Section */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 16, 
              fontWeight: 600, 
              color: 'var(--colors-grey900)' 
            }}>
              Give access to a user or group
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end' }}>
              {/* User or group search field */}
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 14, 
                  fontWeight: 500,
                  color: 'var(--colors-grey700)' 
                }}>
                  User or group
                </label>
                <InputField
                  value={searchQuery}
                  onChange={({ value }) => setSearchQuery(value)}
                  placeholder="Search"
                  onFocus={() => setSelectedUser('')}
                />
                {/* Dropdown with filtered users */}
                {searchQuery && filteredUsers.length > 0 && (
                  <div style={{ 
                    position: 'absolute', 
                    zIndex: 1000, 
                    background: 'white', 
                    border: '1px solid var(--colors-grey300)', 
                    borderRadius: 4, 
                    maxHeight: 200, 
                    overflowY: 'auto',
                    width: '100%',
                    marginTop: 4,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    top: '100%',
                    left: 0
                  }}>
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--colors-grey200)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4
                        }}
                        onClick={() => {
                          setSelectedUser(user.id);
                          setSearchQuery(user.name);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--colors-grey050)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                        }}
                      >
                        <div style={{ fontWeight: 500, color: 'var(--colors-grey900)' }}>{user.name}</div>
                        {user.email && (
                          <div style={{ fontSize: 12, color: 'var(--colors-grey600)' }}>{user.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Access level dropdown */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 14, 
                  fontWeight: 500,
                  color: 'var(--colors-grey700)' 
                }}>
                  Access level
                </label>
                <SingleSelect 
                  selected={permissionType} 
                  onChange={({ selected }) => setPermissionType(selected as any)}
                  placeholder="Choose a level"
                  clearable={false}
                >
                  <SingleSelectOption label="View only" value="read" />
                  <SingleSelectOption label="View and edit" value="write" />
                </SingleSelect>
              </div>

              {/* Give access button */}
              <Button 
                primary
                onClick={addRecipient} 
                disabled={!selectedUser}
              >
                Give access
              </Button>
            </div>
          </div>

          {/* Current Access Section */}
          <div>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 16, 
              fontWeight: 600, 
              color: 'var(--colors-grey900)' 
            }}>
              Users and groups that currently have access
            </h3>
            
            {pending.length === 0 ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                border: '1px solid var(--colors-grey300)', 
                borderRadius: 4, 
                padding: 16,
                background: 'var(--colors-grey050)'
              }}>
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  background: 'var(--colors-grey200)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: 16,
                  color: 'var(--colors-grey600)'
                }}>
                  <IconUserGroup24 />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--colors-grey900)' }}>All users</div>
                  <div style={{ fontSize: 12, color: 'var(--colors-grey600)' }}>Anyone logged in</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <SingleSelect 
                    selected="no-access" 
                    onChange={() => {}}
                    clearable={false}
                  >
                    <SingleSelectOption label="No access" value="no-access" />
                    <SingleSelectOption label="View only" value="view" />
                    <SingleSelectOption label="View and edit" value="edit" />
                  </SingleSelect>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {pending.map((entry, idx) => {
                  const user = users.find(u => u.id === entry.userId);
                  return (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      border: '1px solid var(--colors-grey300)', 
                      borderRadius: 4, 
                      padding: 16,
                      background: 'white'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: 'var(--colors-grey200)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: 12, 
                          fontWeight: 600,
                          color: 'var(--colors-grey700)'
                        }}>
                          {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '—'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--colors-grey900)' }}>
                            {user?.name || 'Unknown User'}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--colors-grey600)' }}>
                            {user?.email || '—'}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <SingleSelect 
                          selected={entry.permissionType} 
                          onChange={({ selected }) => {
                            setPending(prev => prev.map((p, i) => 
                              i === idx ? { ...p, permissionType: selected as any } : p
                            ));
                          }}
                          clearable={false}
                        >
                          <SingleSelectOption label="View only" value="read" />
                          <SingleSelectOption label="View and edit" value="write" />
                        </SingleSelect>
                        
                        <Button 
                          small 
                          secondary 
                          onClick={() => removeRecipient(idx)}
                          icon={<IconCross24 />}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 12, 
          padding: '16px 24px 24px 24px',
          borderTop: '1px solid var(--colors-grey300)',
          background: 'var(--colors-grey050)'
        }}>
          <Button secondary onClick={onClose}>Close</Button>
          <Button primary onClick={handleShare} disabled={pending.length === 0}>Share</Button>
        </div>
      </div>
    </Modal>
  );
}

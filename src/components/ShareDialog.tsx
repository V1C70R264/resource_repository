import { useState, useMemo, useEffect } from "react";
import { Modal, Button, InputField, SingleSelect, SingleSelectOption, DropdownButton, MenuItem, SingleSelectField } from "@dhis2/ui";
import { IconCross24, IconUserGroup24, IconUser24, IconLocation24 } from "@dhis2/ui-icons";
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
  const { refreshUsers, refreshOrgUnits, refreshUserGroups, orgUnits, userGroups } = useDHIS2DataStore();

  const [users, setUsers] = useState<User[]>(usersProp || []);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [permissionType, setPermissionType] = useState<'read' | 'write'>('read');
  const [pending, setPending] = useState<Array<{ 
    id: string; 
    type: 'user' | 'orgUnit' | 'group'; 
    permissionType: 'read'|'write' 
  }>>([]);

  const targetFileIds = (fileIds && fileIds.length > 0) ? fileIds : [fileId];

  // Filter users, organization units, and groups based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results = [];
    
    // Filter users
    const filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    results.push(...filteredUsers.map(user => ({ ...user, type: 'user' as const })));
    
    // Filter organization units
    const filteredOrgUnits = orgUnits.filter(orgUnit => 
      orgUnit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orgUnit.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    results.push(...filteredOrgUnits.map(orgUnit => ({ ...orgUnit, type: 'orgUnit' as const })));
    
    // Filter user groups
    const filteredGroups = userGroups.filter(group => 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    results.push(...filteredGroups.map(group => ({ ...group, type: 'group' as const })));
    
    return results;
  }, [users, orgUnits, userGroups, searchQuery]);

  useEffect(() => {
    const fetchDataIfNeeded = async () => {
      try {
        setUsersLoading(true);
        await Promise.all([
          refreshUsers(),
          refreshOrgUnits(),
          refreshUserGroups()
        ]);
      } catch (e) {
        alerts.critical('Failed to fetch data');
      } finally {
        setUsersLoading(false);
      }
    };
    fetchDataIfNeeded();
  }, [refreshUsers, refreshOrgUnits, refreshUserGroups]);

  const addRecipient = () => {
    if (!selectedUser) return;
    
    // Find the selected item to determine its type
    const selectedItem = filteredResults.find(item => item.id === selectedUser);
    if (!selectedItem) return;
    
    setPending(prev => [...prev, { 
      id: selectedUser, 
      type: selectedItem.type, 
      permissionType 
    }]);
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
          userId: entry.type === 'user' ? entry.id : '', // Keep for backward compatibility
          type: entry.permissionType,
          grantedBy: 'Current User',
          grantedAt: now,
          targetType: entry.type === 'user' ? 'user' : entry.type === 'orgUnit' ? 'orgUnit' : 'group',
          targetId: entry.id,
        });
      }
    }
    onShare(entries);
  };

  const getInitials = (name?: string): string => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).slice(0, 2);
    const initials = parts.map(p => p.charAt(0).toUpperCase()).join('');
    return initials || name.slice(0, 2).toUpperCase();
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
          {/* <Button 
            icon={<IconCross24 />} 
            onClick={onClose}
            secondary
            small
          /> */}
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
            <div style={{
              background: 'var(--colors-grey050, #f5f6f8)',
              border: '1px solid var(--colors-grey300, #d1d5db)',
              borderRadius: 6,
              padding: 12
            }}>
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
                {/* Dropdown with filtered results */}
                {searchQuery && filteredResults.length > 0 && (
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
                    {filteredResults.map(result => (
                      <div
                        key={result.id}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--colors-grey200)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4
                        }}
                        onClick={() => {
                          setSelectedUser(result.id);
                          setSearchQuery(result.name);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--colors-grey050)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                        }}
                      >
                        <div style={{ fontWeight: 500, color: 'var(--colors-grey900)' }}>
                          {result.name}
                          {result.type !== 'user' && (
                            <span style={{ 
                              fontSize: 11, 
                              color: 'var(--colors-grey500)', 
                              marginLeft: 8,
                              fontWeight: 400 
                            }}>
                              ({result.type === 'orgUnit' ? 'Organization Unit' : 'User Group'})
                            </span>
                          )}
                        </div>
                        {result.email && (
                          <div style={{ fontSize: 12, color: 'var(--colors-grey600)' }}>{result.email}</div>
                        )}
                        {result.type === 'orgUnit' && result.level && (
                          <div style={{ fontSize: 12, color: 'var(--colors-grey600)' }}>Level {result.level}</div>
                        )}
                        {result.type === 'group' && result.description && (
                          <div style={{ fontSize: 12, color: 'var(--colors-grey600)' }}>{result.description}</div>
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
                <SingleSelectField 
                  // clearable={true}
                  selected={permissionType}
                  onChange={({ selected }) => setPermissionType(selected as any)}
                  placeholder="Choose a level"
                  prefix='Access to'
                  // clearable={true}
                
                >
                  <SingleSelectOption label="View only" value="read" />
                  <SingleSelectOption label="View and edit" value="write" />

                </SingleSelectField>
              </div>

              {/* Give access button */}
              <Button 
              
                onClick={addRecipient} 
                disabled={!selectedUser}
              >
                Give access
              </Button>
            </div>
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
              <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--colors-grey050, #f5f6f8)',
                border: '1px solid var(--colors-grey300, #d1d5db)',
                borderRadius: 4,
                color: 'var(--colors-grey800, #1f2937)',
                fontSize: 13,
                marginBottom: 8
              }}>
                <span style={{ fontWeight: 500 }}>User / Group</span>
                <span style={{ fontWeight: 500 }}>Access level</span>
              </div>
              <div style={{ 
                display: 'grid', 
                gap: 8, 
                maxHeight: 200, 
                overflowY: 'auto',
                paddingRight: 4
              }}>
                {pending.map((entry, idx) => {
                  // Find the item based on its type
                  let item: any = null;
                  if (entry.type === 'user') {
                    item = users.find(u => u.id === entry.id);
                  } else if (entry.type === 'orgUnit') {
                    item = orgUnits.find(o => o.id === entry.id);
                  } else if (entry.type === 'group') {
                    item = userGroups.find(g => g.id === entry.id);
                  }
                  
                  return (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      border: '1px solid var(--colors-grey300)', 
                      borderRadius: 4, 
                      padding: 12,
                      background: 'white'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ 
                          width: 28, 
                          height: 28, 
                          borderRadius: '50%', 
                          background: 'var(--colors-grey400, #9aa4b2)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 11,
                          fontWeight: 700,
                          border: '1px solid var(--colors-grey300, #d1d5db)'
                        }}>
                          {getInitials(item?.name) ? getInitials(item?.name) : <IconUser24 />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--colors-grey900)' }}>
                            {item?.name || 'Unknown Item'}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--colors-grey600)' }}>
                            {item?.id}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* <Button small secondary>Metadata</Button> */}
                        <SingleSelect 
                        prefix='Metadata'
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
                        {/* <Button 
                          small 
                          secondary 
                          onClick={() => removeRecipient(idx)}
                          icon={<IconCross24 />}
                        /> */}
                      </div>
                    </div>
                  );
                })}
              </div>
              </>
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

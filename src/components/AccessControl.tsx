// import { useState } from "react";
// import { format } from "date-fns";
// import {
//   Modal,
//   Button,
//   InputField,
//   SingleSelect,
//   SingleSelectOption,
//   Tag as DHIS2Tag,
// } from "@dhis2/ui";
// import { IconEdit24, IconAdd24, IconSettings24, IconCross24 } from "@dhis2/ui-icons";
// import { Permission, User as UserType } from "@/lib/types";

// interface AccessControlProps {
//   fileId: string;
//   fileName: string;
//   permissions: Permission[];
//   users: UserType[];
//   isOpen: boolean;
//   onClose: () => void;
//   onPermissionChange: (permission: Permission & { groupId?: string; roleId?: string; orgUnitId?: string }, action: 'add' | 'update' | 'remove') => void;
// }

// const permissionTypes = [
//   { value: 'read', label: 'Can view' },
//   { value: 'write', label: 'Can edit' },
//   { value: 'admin', label: 'Full access' },
// ];

// export function AccessControlDialog({
//   fileId,
//   fileName,
//   permissions,
//   users,
//   isOpen,
//   onClose,
//   onPermissionChange,
// }: AccessControlProps) {
//   if (!isOpen) return null;

//   const safeFormatDate = (value?: string) => {
//     if (!value) return null;
//     const d = new Date(value);
//     return isNaN(d.getTime()) ? null : format(d, 'MMM dd, yyyy');
//     };

//   const [selectedUser, setSelectedUser] = useState("");
//   const [selectedPermission, setSelectedPermission] = useState("read");
//   const [expiryDate, setExpiryDate] = useState("");

//   // extra assignment dimensions
//   const [targetType, setTargetType] = useState<'user'|'group'|'role'|'orgUnit'>('user');
//   const [targetId, setTargetId] = useState("");

//   const handleAddPermission = () => {
//     if (!targetId) return;

//     const base: Permission & { groupId?: string; roleId?: string; orgUnitId?: string } = {
//       id: `perm_${Date.now()}`,
//       fileId,
//       fileName: fileName,
//       userId: targetType === 'user' ? targetId : '',
//       type: selectedPermission as 'read' | 'write' | 'admin',
//       grantedBy: "Current User",
//       grantedAt: new Date().toISOString(),
//       expiresAt: expiryDate || undefined,
//     } as any;

//     if (targetType === 'group') (base as any).groupId = targetId;
//     if (targetType === 'role') (base as any).roleId = targetId;
//     if (targetType === 'orgUnit') (base as any).orgUnitId = targetId;

//     onPermissionChange(base, 'add');

//     // reset
//     setTargetId("");
//     setTargetType('user');
//     setSelectedPermission('read');
//     setExpiryDate("");
//   };

//   const handleRemovePermission = (permissionId: string) => {
//     const permission = permissions.find(p => p.id === permissionId);
//     if (permission) {
//       onPermissionChange(permission, 'remove');
//     }
//   };

//   const getPermissionUser = (userId: string) => users.find(user => user.id === userId);

//   return (
//     <Modal onClose={onClose} large>
//       <div style={{ padding: 20, maxWidth: 880, display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
//         {/* Header */}
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
//             <IconSettings24 />
//             <span>Access control — {fileName}</span>
//           </div>
//         </div>

//         {/* Scrollable content */}
//         <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
//           {/* Add New Permission */}
//           <div style={{ border: '1px solid var(--colors-grey300)', borderRadius: 8, padding: 16, marginBottom: 16, background: 'var(--colors-grey050)' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, marginBottom: 12 }}>
//               <IconAdd24 />
//               <span>Add permission</span>
//             </div>

//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
//               <div>
//                 <div style={{ fontSize: 12, color: 'var(--colors-grey700)', marginBottom: 4 }}>Target type</div>
//                 <SingleSelect selected={targetType} onChange={({ selected }) => setTargetType(selected as any)}>
//                   <SingleSelectOption label="User" value="user" />
//                   <SingleSelectOption label="Group" value="group" />
//                   <SingleSelectOption label="Role" value="role" />
//                   <SingleSelectOption label="Org unit" value="orgUnit" />
//                 </SingleSelect>
//               </div>

//               <div>
//                 <InputField
//                   label="Target ID"
//                   value={targetId}
//                   onChange={({ value }) => setTargetId(value)}
//                   placeholder="Enter user/group/role/orgUnit ID"
//                 />
//               </div>

//               <div>
//                 <div style={{ fontSize: 12, color: 'var(--colors-grey700)', marginBottom: 4 }}>Permission</div>
//                 <SingleSelect selected={selectedPermission} onChange={({ selected }) => setSelectedPermission(selected)}>
//                   {permissionTypes.map((type) => (
//                     <SingleSelectOption key={type.value} label={type.label} value={type.value} />
//                   ))}
//                 </SingleSelect>
//               </div>

//               {/* <div>
//                 <InputField
//                   label="Expires (optional)"
//                   value={expiryDate}
//                   onChange={({ value }) => setExpiryDate(value)}
//                   placeholder="YYYY-MM-DD"
//                 />
//               </div> */}
//             </div>

//             <div style={{ marginTop: 12 }}>
//               <Button primary disabled={!targetId} onClick={handleAddPermission}>
//                 <IconAdd24 /> Add permission
//               </Button>
//             </div>
//           </div>

//           {/* Current Permissions */}
//           <div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, marginBottom: 8 }}>
//               <span>Current permissions ({permissions.length})</span>
//             </div>

//             {permissions.length === 0 ? (
//               <div style={{ textAlign: 'center', color: 'var(--colors-grey700)', padding: '24px 0' }}>
//                 <div style={{ fontSize: 14 }}>No specific permissions set</div>
//                 <div style={{ fontSize: 12 }}>This resource uses default permissions</div>
//               </div>
//             ) : (
//               <div style={{ display: 'grid', gap: 8 }}>
//                 {permissions.map((permission) => {
//                   const user = permission.userId ? getPermissionUser(permission.userId) : undefined;
//                   const grantedAtLabel = safeFormatDate(permission.grantedAt);
//                   const expiresAtLabel = safeFormatDate(permission.expiresAt);

//                   return (
//                     <div key={permission.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--colors-grey300)', borderRadius: 8, padding: 12 }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                         <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--colors-grey200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
//                           {user ? (user.name.split(' ').map(n => n[0]).join('').slice(0, 2)) : '—'}
//                         </div>
//                         <div>
//                           <div style={{ fontWeight: 600 }}>{user ? user.name : (permission as any).groupId || (permission as any).roleId || (permission as any).orgUnitId}</div>
//                           <div style={{ fontSize: 12, color: 'var(--colors-grey700)' }}>{user?.email || '—'}</div>
//                         </div>
//                         <div>
//                           <DHIS2Tag>{permissionTypes.find(p => p.value === permission.type)?.label || permission.type}</DHIS2Tag>
//                         </div>
//                       </div>

//                       <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
//                         <div style={{ fontSize: 12, color: 'var(--colors-grey700)', textAlign: 'right' }}>
//                           <div>Granted by {permission.grantedBy}</div>
//                           {grantedAtLabel && <div>{grantedAtLabel}</div>}
//                           {expiresAtLabel && <div style={{ color: '#C05621' }}>Expires {expiresAtLabel}</div>}
//                         </div>
//                         <div style={{ display: 'flex', gap: 8 }}>
//                           <Button secondary small>
//                             <IconEdit24 />
//                           </Button>
//                           <Button secondary small onClick={() => handleRemovePermission(permission.id)}>
//                             <IconCross24 />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
//           <Button secondary onClick={onClose}>Close</Button>
//         </div>
//       </div>
//     </Modal>
//   );
// } 
import { useState } from "react";
import { Shield, User, Users, Lock, Unlock, Plus, Trash2, Edit, Eye } from "lucide-react";
import { DHIS2Button, DHIS2Input } from "@/components/ui/dhis2-components";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Permission, User as UserType } from "@/lib/types";
import { format } from "date-fns";

interface AccessControlProps {
  fileId: string;
  fileName: string;
  permissions: Permission[];
  users: UserType[];
  isOpen: boolean;
  onClose: () => void;
  onPermissionChange: (permission: Permission, action: 'add' | 'update' | 'remove') => void;
}

const permissionTypes = [
  { value: 'read', label: 'Can view', icon: Eye, color: 'bg-blue-100 text-blue-800' },
  { value: 'write', label: 'Can edit', icon: Edit, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'admin', label: 'Full access', icon: Shield, color: 'bg-red-100 text-red-800' },
];

export function AccessControlDialog({
  fileId,
  fileName,
  permissions,
  users,
  isOpen,
  onClose,
  onPermissionChange,
}: AccessControlProps) {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("read");
  const [expiryDate, setExpiryDate] = useState("");

  const handleAddPermission = () => {
    if (!selectedUser) return;

    const newPermission: Permission = {
      id: `perm_${Date.now()}`,
      fileId,
      userId: selectedUser,
      type: selectedPermission as 'read' | 'write' | 'admin',
      grantedBy: "Current User",
      grantedAt: new Date().toISOString(),
      expiresAt: expiryDate || undefined,
    };

    onPermissionChange(newPermission, 'add');
    setSelectedUser("");
    setSelectedPermission("read");
    setExpiryDate("");
  };

  const handleRemovePermission = (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId);
    if (permission) {
      onPermissionChange(permission, 'remove');
    }
  };

  const getPermissionUser = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const getPermissionTypeInfo = (type: string) => {
    return permissionTypes.find(pt => pt.value === type);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Access Control - {fileName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Permission */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Permission
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">User</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Permission</label>
                <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {permissionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Expires (optional)</label>
                <DHIS2Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.value)}
                />
              </div>
            </div>

            <DHIS2Button primary onClick={handleAddPermission} disabled={!selectedUser}>
              Add Permission
            </DHIS2Button>
          </div>

          {/* Current Permissions */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Current Permissions ({permissions.length})
            </h3>

            {permissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No specific permissions set</p>
                <p className="text-sm">This file uses default permissions</p>
              </div>
            ) : (
              <div className="space-y-2">
                {permissions.map((permission) => {
                  const user = getPermissionUser(permission.userId);
                  const typeInfo = getPermissionTypeInfo(permission.type);
                  
                  return (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="text-xs">
                            {user?.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="font-medium">{user?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user?.email}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {typeInfo && (
                            <Badge variant="secondary" className={typeInfo.color}>
                              <typeInfo.icon className="w-3 h-3 mr-1" />
                              {typeInfo.label}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground text-right">
                          <div>Granted by {permission.grantedBy}</div>
                          <div>{format(new Date(permission.grantedAt), "MMM dd, yyyy")}</div>
                          {permission.expiresAt && (
                            <div className="text-orange-600">
                              Expires {format(new Date(permission.expiresAt), "MMM dd, yyyy")}
                            </div>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <DHIS2Button secondary small>
                              <Edit className="w-4 h-4" />
                            </DHIS2Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Edit Permission</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemovePermission(permission.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
            <div>
              {permissions.length} specific permissions set
            </div>
            <div className="flex items-center gap-4">
              {permissionTypes.map((type) => (
                <div key={type.value} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${type.color.replace('bg-', 'bg-').replace(' text-', '')}`}></div>
                  <span className="text-xs">{type.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
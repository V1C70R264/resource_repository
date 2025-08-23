import { useState } from 'react'
import { Button, Card, Menu, MenuItem, Popover, Tag, DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableCell, DataTableColumnHeader, Checkbox } from '@dhis2/ui'
import { IconFolder24, IconFileDocument24, IconStarFilled16 } from '@dhis2/ui-icons'
import { FileItem } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'
import { DHIS2Card } from '@/components/ui/dhis2-components';

interface FileGridProps {
  items: FileItem[];
  viewMode: 'grid' | 'list';
  onItemClick: (item: FileItem) => void;
  onItemAction: (action: string, item: FileItem) => void;
  folderChildCounts?: Record<string, number>;
  selectedItems?: string[];
  showCheckboxes?: { [id: string]: boolean };
  onItemTap?: (item: FileItem) => void;
  onSelectChange?: (item: FileItem, checked: boolean) => void;
  canDelete?: (item: FileItem) => boolean;
}

export function FileGrid({ items, viewMode, onItemClick, onItemAction, folderChildCounts = {}, selectedItems, showCheckboxes, onItemTap, onSelectChange, canDelete }: FileGridProps) {
  const DHIS_BLUE_TINT = 'rgba(10, 110, 180, 0.08)'
  // Single contextual menu using DHIS2 Popover + Menu
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuItem, setMenuItem] = useState<FileItem | null>(null)

  const openMenu = (buttonId: string, item: FileItem) => {
    const el = document.getElementById(buttonId)
    if (el) {
      setMenuAnchor(el)
      setMenuItem(item)
    }
  }

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuItem(null)
  }

  const renderMainIcon = (type: string, fileType?: string) => {
    const colorClass = type === 'folder' ? 'text-drive-blue' : 'text-blue-500'
    return (
      <span className={`w-12 h-12 ${colorClass} inline-flex items-center justify-center`}>
        {type === 'folder' ? <IconFolder24 /> : <IconFileDocument24 />}
      </span>
    )
  }

  const openItem = (item: FileItem) => {
    if (item.type === 'file') {
      onItemAction('preview', item)
    } else {
      onItemClick(item)
    }
  }

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <DataTable>
            <DataTableHead>
              <DataTableRow>
                <DataTableColumnHeader>Name</DataTableColumnHeader>
                <DataTableColumnHeader>Owner</DataTableColumnHeader>
                <DataTableColumnHeader>Last modified</DataTableColumnHeader>
                <DataTableColumnHeader>Size</DataTableColumnHeader>
                <DataTableColumnHeader align="center">Actions</DataTableColumnHeader>
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {items.map((item) => {
                const btnId = `menu-btn-list-${item.id}`
                const childCount = folderChildCounts[item.id] || 0
                const isSelected = selectedItems?.includes(item.id) || false
                return (
                  <DataTableRow key={item.id} selected={isSelected}>
                    <DataTableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        {showCheckboxes && showCheckboxes[item.id] && (
                          <div
                            onMouseDown={(e) => { e.stopPropagation(); }}
                            onClick={(e) => { e.stopPropagation(); }}
                          >
                            <Checkbox
                              checked={selectedItems?.includes(item.id) || false}
                              onChange={({ checked }) => onSelectChange && onSelectChange(item, checked)}
                              dense
                            />
                          </div>
                        )}
                        <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.type === 'folder' ? <IconFolder24 /> : <IconFileDocument24 />}
                        </span>
                        <button
                          type="button"
                          style={{
                            appearance: 'none',
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            margin: 0,
                            color: 'var(--colors-grey900)',
                            cursor: 'pointer',
                            maxWidth: 280,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: 500,
                          }}
                          title={item.name}
                          onClick={() => {
                            // For files, immediately trigger preview
                            if (item.type === 'file') {
                              onItemAction('preview', item);
                            } else {
                              // For folders, use the tap handler if available, otherwise open directly
                              if (onItemTap) onItemTap(item);
                              else onItemClick(item);
                            }
                          }}
                        >
                          {item.name}
                        </button>
                        {item.type === 'folder' && (
                          <Tag>{childCount} item{childCount === 1 ? '' : 's'}</Tag>
                        )}
                        {item.starred && (
                          <span style={{ color: 'var(--colors-grey900)', fontSize: 16, verticalAlign: 'middle' }}>
                            <IconStarFilled16 />
                          </span>
                        )}
                        {item.shared && <span style={{ color: '#1E88E5', fontSize: 12 }}>⇢</span>}
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', overflow: 'hidden' }}>
                          {item.tags?.slice(0, 2).map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                          {item.tags && item.tags.length > 2 && (
                            <Tag>+{item.tags.length - 2}</Tag>
                          )}
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell>{item.owner}</DataTableCell>
                    <DataTableCell>{formatDateTime(item.modified)}</DataTableCell>
                    <DataTableCell>{item.type === 'file' ? (item.sizeFormatted || '-') : `${childCount} item${childCount === 1 ? '' : 's'}`}</DataTableCell>
                    <DataTableCell align="center">
                      <Button
                        id={btnId}
                        small
                        secondary
                        onClick={() => openMenu(btnId, item)}
                      >
                        ⋮
                      </Button>
                    </DataTableCell>
                  </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
        </div>

        {menuAnchor && (
          <Popover reference={menuAnchor} onClickOutside={closeMenu} placement="bottom-end">
            <Menu>
              <MenuItem label="Preview" onClick={() => { if (menuItem) onItemAction('preview', menuItem); closeMenu(); }} />
              <MenuItem label="Download" onClick={() => { if (menuItem) onItemAction('download', menuItem); closeMenu(); }} />
              <MenuItem label="Share" onClick={() => { if (menuItem) onItemAction('share', menuItem); closeMenu(); }} />
              <MenuItem label={menuItem?.starred ? 'Remove star' : 'Add star'} onClick={() => { if (menuItem) onItemAction('star', menuItem); closeMenu(); }} />
              <MenuItem label="Edit Metadata" onClick={() => { if (menuItem) onItemAction('metadata', menuItem); closeMenu(); }} />
              {/* <MenuItem label="Access Control" onClick={() => { if (menuItem) onItemAction('permissions', menuItem); closeMenu(); }} /> */}
              <MenuItem label="View Audit Log" onClick={() => { if (menuItem) onItemAction('audit', menuItem); closeMenu(); }} />
              {(!menuItem || !canDelete || canDelete(menuItem)) && (
                <MenuItem destructive label="Delete" onClick={() => { if (menuItem) onItemAction('delete', menuItem); closeMenu(); }} />
              )}
            </Menu>
          </Popover>
        )}
      </>
    )
  }

  // GRID VIEW (unchanged)
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {items.map((item) => {
          const btnId = `menu-btn-grid-${item.id}`
          const childCount = folderChildCounts[item.id] || 0
          const isSelected = selectedItems?.includes(item.id) || false
          return (
            <div key={item.id} className="group relative cursor-pointer" onClick={() => {
              // For files, immediately trigger preview
              if (item.type === 'file') {
                onItemAction('preview', item);
              } else {
                // For folders, use the tap handler if available
                if (onItemTap) onItemTap(item);
                else onItemClick(item);
              }
            }}>
              <Card>
                {/* Increase height to fit icon, name, size, and a reserved tags row */}
                <div className={`hover:shadow-md transition-all hover:border-drive-blue/30 h-40 w-full p-4 ${isSelected ? 'bg-[rgba(10,110,180,0.08)]' : ''}`}>
                  {showCheckboxes && showCheckboxes[item.id] && (
                    <div
                      className="absolute left-2 bottom-2 z-10"
                      onMouseDown={(e) => { e.stopPropagation(); }}
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <Checkbox
                        checked={selectedItems?.includes(item.id) || false}
                        onChange={({ checked }) => onSelectChange && onSelectChange(item, checked)}
                        dense
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="relative mb-2">
                      {renderMainIcon(item.type, item.fileType)}
                    </div>

                    <div className="w-full">
                      <p className="font-medium text-sm text-foreground truncate" title={item.name}>{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type === 'folder' ? (
                          `${childCount} item${childCount === 1 ? '' : 's'}`
                        ) : (
                          item.sizeFormatted || '-'
                        )}
                      </p>
                    </div>

                    {/* Reserved single-row space for tags (same height whether present or not) */}
                    <div className="mt-1 h-6 w-full flex items-center justify-center overflow-hidden">
                      {item.tags && item.tags.length > 0 ? (
                        <div className="flex items-center gap-1 overflow-hidden">
                          {item.tags.slice(0, 2).map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                          {item.tags.length > 2 && (
                            <Tag>+{item.tags.length - 2}</Tag>
                          )}
                        </div>
                      ) : (
                        <span className="sr-only">no tags</span>
                      )}
                    </div>

                    {/* Star/Share markers anchored below icon so they don't shift layout */}
                    <div className="absolute left-2 top-2 text-xs">
                      {item.starred && (
                        <span style={{ color: 'var(--colors-grey900)' }}>
                          <IconStarFilled16 />
                        </span>
                      )}
                    </div>
                    <div className="absolute right-2 top-2 text-xs">
                      {item.shared && <span style={{ color: '#1E88E5', fontSize: 12 }}>⇢</span>}
                    </div>
                  </div>

                  <div
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button id={btnId} small secondary onClick={() => openMenu(btnId, item)}>
                      ⋮
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>

      {menuAnchor && (
        <Popover reference={menuAnchor} onClickOutside={closeMenu} placement="bottom-end">
          <Menu>
            <MenuItem label="Preview" onClick={() => { if (menuItem) onItemAction('preview', menuItem); closeMenu(); }} />
            <MenuItem label="Download" onClick={() => { if (menuItem) onItemAction('download', menuItem); closeMenu(); }} />
            <MenuItem label="Share" onClick={() => { if (menuItem) onItemAction('share', menuItem); closeMenu(); }} />
            <MenuItem label={menuItem?.starred ? 'Remove star' : 'Add star'} onClick={() => { if (menuItem) onItemAction('star', menuItem); closeMenu(); }} />
            <MenuItem label="Edit Metadata" onClick={() => { if (menuItem) onItemAction('metadata', menuItem); closeMenu(); }} />
            {/* <MenuItem label="Access Control" onClick={() => { if (menuItem) onItemAction('permissions', menuItem); closeMenu(); }} /> */}
            <MenuItem label="View Audit Log" onClick={() => { if (menuItem) onItemAction('audit', menuItem); closeMenu(); }} />
            {(!menuItem || !canDelete || canDelete(menuItem)) && (
              <MenuItem destructive label="Delete" onClick={() => { if (menuItem) onItemAction('delete', menuItem); closeMenu(); }} />
            )}
          </Menu>
        </Popover>
      )}
    </>
  )
}
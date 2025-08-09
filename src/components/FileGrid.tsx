import { useState } from 'react'
import { Button, Card, Modal, Menu, MenuItem, Popover, Tag, DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableCell, DataTableColumnHeader } from '@dhis2/ui'
import { IconFolder24, IconFileDocument24 } from '@dhis2/ui-icons'
import { FileItem } from '@/lib/types'

interface FileGridProps {
  items: FileItem[]
  viewMode: 'grid' | 'list'
  onItemClick: (item: FileItem) => void
  onItemAction: (action: string, item: FileItem) => void
}

export function FileGrid({ items, viewMode, onItemClick, onItemAction }: FileGridProps) {
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

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
      setSelectedItem(item)
      setPreviewOpen(true)
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
                return (
                  <DataTableRow key={item.id}>
                    <DataTableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
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
                          onClick={() => openItem(item)}
                        >
                          {item.name}
                        </button>
                        {item.starred && <span style={{ color: '#B58900', fontSize: 12 }}>★</span>}
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
                    <DataTableCell>{item.modified}</DataTableCell>
                    <DataTableCell>{item.sizeFormatted || '-'}</DataTableCell>
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
              <MenuItem label="Access Control" onClick={() => { if (menuItem) onItemAction('permissions', menuItem); closeMenu(); }} />
              <MenuItem label="View Audit Log" onClick={() => { if (menuItem) onItemAction('audit', menuItem); closeMenu(); }} />
              <MenuItem destructive label="Delete" onClick={() => { if (menuItem) onItemAction('delete', menuItem); closeMenu(); }} />
            </Menu>
          </Popover>
        )}

        {previewOpen && (
          <Modal onClose={() => setPreviewOpen(false)}>
            <div style={{ padding: 16, maxWidth: 960, maxHeight: '80vh', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 600 }}>
                {selectedItem && (
                  <>
                    <span>{renderMainIcon(selectedItem.type, selectedItem.fileType)}</span>
                    <span>{selectedItem.name}</span>
                  </>
                )}
              </div>
              {selectedItem && (
                <div style={{ display: 'flex', gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div className="bg-muted/30 rounded-lg p-8 text-center">
                      <div className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">File preview will be displayed here</p>
                    </div>
                  </div>
                  <div style={{ width: 320 }}>
                    <div>
                      <h3 className="font-semibold mb-2">Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span>{selectedItem.fileType || 'Folder'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Size:</span><span>{selectedItem.size || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Owner:</span><span>{selectedItem.owner}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Modified:</span><span>{selectedItem.modified}</span></div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.tags?.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        )) || <span className="text-sm text-muted-foreground">No tags</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button primary onClick={() => onItemAction('download', selectedItem)}>Download</Button>
                      <Button secondary onClick={() => onItemAction('share', selectedItem)}>Share</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal>
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
          return (
            <div key={item.id} className="group relative cursor-pointer" onClick={() => openItem(item)}>
              <Card>
                {/* Increase height to fit icon, name, size, and a reserved tags row */}
                <div className="hover:shadow-md transition-all hover:border-drive-blue/30 h-40 w-full p-4">
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="relative mb-2">
                      {renderMainIcon(item.type, item.fileType)}
                    </div>

                    <div className="w-full">
                      <p className="font-medium text-sm text-foreground truncate" title={item.name}>{item.name}</p>
                      {item.size && (<p className="text-xs text-muted-foreground">{item.size}</p>)}
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
                      {item.shared && (<span className="text-blue-600">⇢</span>)}
                    </div>
                    <div className="absolute right-2 top-2 text-xs">
                      {item.starred && (<span className="text-yellow-600">★</span>)}
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
            <MenuItem label="Access Control" onClick={() => { if (menuItem) onItemAction('permissions', menuItem); closeMenu(); }} />
            <MenuItem label="View Audit Log" onClick={() => { if (menuItem) onItemAction('audit', menuItem); closeMenu(); }} />
            <MenuItem destructive label="Delete" onClick={() => { if (menuItem) onItemAction('delete', menuItem); closeMenu(); }} />
          </Menu>
        </Popover>
      )}

      {previewOpen && (
        <Modal onClose={() => setPreviewOpen(false)}>
          <div style={{ padding: 16, maxWidth: 960, maxHeight: '80vh', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 600 }}>
              {selectedItem && (<><span>{renderMainIcon(selectedItem.type, selectedItem.fileType)}</span><span>{selectedItem.name}</span></>)}
            </div>
            {selectedItem && (
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[400px] flex items-center justify-center">
                    <div>
                      <div className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">File preview will be displayed here</p>
                    </div>
                  </div>
                </div>
                <div style={{ width: 320 }}>
                  <div>
                    <h3 className="font-semibold mb-2">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span>{selectedItem.fileType || 'Folder'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Size:</span><span>{selectedItem.size || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Owner:</span><span>{selectedItem.owner}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Modified:</span><span>{selectedItem.modified}</span></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.tags?.map((tag) => (<Tag key={tag}>{tag}</Tag>)) || <span className="text-sm text-muted-foreground">No tags</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button primary onClick={() => onItemAction('download', selectedItem!)}>
                      Download
                    </Button>
                    <Button secondary onClick={() => onItemAction('share', selectedItem!)}>
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
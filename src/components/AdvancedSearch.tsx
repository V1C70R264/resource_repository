import { useState, useEffect, useRef } from "react";
import { Button, Input, Checkbox, Chip } from "@dhis2/ui";
import { 
  IconSearch24, 
  IconFilter24,
  IconStar24,
  IconShare24,
  IconList24,
  IconVisualizationColumn24
} from "@dhis2/ui-icons";

import { SearchFilters } from "@/lib/types";

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags: string[];
  availableFileTypes: string[];
  availableOwners: string[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function AdvancedSearch({
  filters,
  onFiltersChange,
  availableTags,
  availableFileTypes,
  availableOwners,
  viewMode,
  onViewModeChange,
}: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      query: "",
      fileTypes: [],
      tags: [],
      dateRange: {},
      owners: [],
      starred: false,
      shared: false,
    });
  };

  const hasActiveFilters = 
    filters.query ||
    filters.fileTypes.length > 0 ||
    filters.tags.length > 0 ||
    filters.owners.length > 0 ||
    filters.starred ||
    filters.shared ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
      {/* Search Input */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '448px', minWidth: 0, display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          position: 'absolute', 
          left: '8px', 
          color: '#666',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          {/* <IconSearch24 /> */}
        </div>
        <div style={{ position: 'relative', width: '100%' }}>
          <Input
            type="text"
            placeholder="  Search files, folders, and content..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.value })}
          />
          {filters.query && (
            <button
              onClick={() => updateFilters({ query: "" })}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '20px',
                width: '20px',
                padding: 0,
                background: 'none',
                border: 'none',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#666',
                fontSize: '16px'
              }}
              type="button"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter Button */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <Button
          {...(hasActiveFilters ? { primary: true } : { secondary: true })}
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <IconFilter24 />
          Filters
          {hasActiveFilters && (
            <Chip>
              {[
                filters.fileTypes.length,
                filters.tags.length,
                filters.owners.length,
                filters.starred ? 1 : 0,
                filters.shared ? 1 : 0,
                filters.dateRange.start ? 1 : 0,
                filters.dateRange.end ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </Chip>
          )}
        </Button>
        {isOpen && (
          <div style={{ 
            position: 'absolute',
            right: 0,
            top: '100%',
            width: '320px',
            backgroundColor: 'white',
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            marginTop: '4px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontWeight: '500', fontSize: '16px' }}>Search Filters</h4>
                {hasActiveFilters && (
                  <Button
                    secondary
                    onClick={clearFilters}
                    style={{ fontSize: '14px', padding: '4px 8px' }}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* File Types */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>File Types</label>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  maxHeight: '128px', 
                  overflowY: 'auto' 
                }}>
                  {availableFileTypes.map((type) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox
                        checked={filters.fileTypes.includes(type)}
                        onChange={(e) => {
                          if (e.checked) {
                            updateFilters({
                              fileTypes: [...filters.fileTypes, type],
                            });
                          } else {
                            updateFilters({
                              fileTypes: filters.fileTypes.filter((t) => t !== type),
                            });
                          }
                        }}
                      />
                      <label style={{ fontSize: '14px', cursor: 'pointer' }}>
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Tags</label>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  maxHeight: '128px', 
                  overflowY: 'auto' 
                }}>
                  {availableTags.map((tag) => (
                    <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox
                        checked={filters.tags.includes(tag)}
                        onChange={(e) => {
                          if (e.checked) {
                            updateFilters({
                              tags: [...filters.tags, tag],
                            });
                          } else {
                            updateFilters({
                              tags: filters.tags.filter((t) => t !== tag),
                            });
                          }
                        }}
                      />
                      <label style={{ fontSize: '14px', cursor: 'pointer' }}>
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Owners */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Owners</label>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  maxHeight: '128px', 
                  overflowY: 'auto' 
                }}>
                  {availableOwners.map((owner) => (
                    <div key={owner} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox
                        checked={filters.owners.includes(owner)}
                        onChange={(e) => {
                          if (e.checked) {
                            updateFilters({
                              owners: [...filters.owners, owner],
                            });
                          } else {
                            updateFilters({
                              owners: filters.owners.filter((o) => o !== owner),
                            });
                          }
                        }}
                      />
                      <label style={{ fontSize: '14px', cursor: 'pointer' }}>
                        {owner}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Date Range</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>From</label>
                    <input
                      type="date"
                      value={filters.dateRange.start || ""}
                      onChange={(e) =>
                        updateFilters({
                          dateRange: { ...filters.dateRange, start: e.target.value },
                        })
                      }
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        fontSize: '14px', 
                        border: '1px solid #e1e5e9', 
                        borderRadius: '4px' 
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>To</label>
                    <input
                      type="date"
                      value={filters.dateRange.end || ""}
                      onChange={(e) =>
                        updateFilters({
                          dateRange: { ...filters.dateRange, end: e.target.value },
                        })
                      }
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        fontSize: '14px', 
                        border: '1px solid #e1e5e9', 
                        borderRadius: '4px' 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Quick Filters</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox
                      checked={filters.starred}
                      onChange={(e) =>
                        updateFilters({ starred: e.checked })
                      }
                    />
                    <label style={{ fontSize: '14px', cursor: 'pointer' }}>
                      Starred
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox
                      checked={filters.shared}
                      onChange={(e) =>
                        updateFilters({ shared: e.checked })
                      }
                    />
                    <label style={{ fontSize: '14px', cursor: 'pointer' }}>
                      Shared
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Toggle - Only show if onViewModeChange is provided */}
      {onViewModeChange && viewMode && (
        <div style={{ 
          display: 'flex', 
          border: '1px solid #e1e5e9', 
          borderRadius: '8px', 
          padding: '4px', 
          backgroundColor: '#f8f9fa',
          marginLeft: '8px'
        }}>
          <Button
            {...(viewMode === 'grid' ? { primary: true } : { secondary: true })}
            onClick={() => onViewModeChange('grid')}
            style={{ height: '32px', width: '32px', padding: 0, minWidth: '32px' }}
          >
            <IconVisualizationColumn24 />
          </Button>
          <Button
            {...(viewMode === 'list' ? { primary: true } : { secondary: true })}
            onClick={() => onViewModeChange('list')}
            style={{ height: '32px', width: '32px', padding: 0, minWidth: '32px' }}
          >
            <IconList24 />
          </Button>
        </div>
      )}
    </div>
  );
} 
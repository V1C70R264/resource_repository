import { useState, useEffect, useRef } from "react";
import { Button, Input } from "@dhis2/ui";
import { 
  IconFilter24,
  IconList24,
  IconVisualizationColumn24,
  IconApps24
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
        <div style={{ position: 'relative', width: '100%', display: 'flex', gap: 6 }}>
          <Input
            type="text"
            placeholder="Search files, folders, and content..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.value })}
          />
          {filters.query && (
            <Button small primary onClick={() => updateFilters({ query: "" })}>Clear</Button>
          )}
        </div>
      </div>

      {/* Filter Button */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <Button
          {...(hasActiveFilters ? { primary: true } : { primary: true })}
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <IconFilter24 />
          Filters
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
                  <Button secondary onClick={clearFilters} style={{ fontSize: '14px', padding: '4px 8px' }}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* File Types */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>File Types</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {availableFileTypes.map((type) => {
                    const active = filters.fileTypes.includes(type);
                    return (
                      <Button key={type} small {...(active ? { primary: true } : { secondary: true })} onClick={() => {
                        updateFilters({ fileTypes: active ? filters.fileTypes.filter(t => t !== type) : [...filters.fileTypes, type] });
                      }}>
                        {type}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {availableTags.map((tag) => {
                    const active = filters.tags.includes(tag);
                    return (
                      <Button key={tag} small {...(active ? { primary: true } : { secondary: true })} onClick={() => {
                        updateFilters({ tags: active ? filters.tags.filter(t => t !== tag) : [...filters.tags, tag] });
                      }}>
                        {tag}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Owners */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Owners</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {availableOwners.map((owner) => {
                    const active = filters.owners.includes(owner);
                    return (
                      <Button key={owner} small {...(active ? { primary: true } : { secondary: true })} onClick={() => {
                        updateFilters({ owners: active ? filters.owners.filter(o => o !== owner) : [...filters.owners, owner] });
                      }}>
                        {owner}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Date range */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Date range</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Input
                    type="date"
                    value={filters.dateRange.start || ''}
                    onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, start: e.value } })}
                  />
                  <Input
                    type="date"
                    value={filters.dateRange.end || ''}
                    onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, end: e.value } })}
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Quick Filters</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  <Button small {...(filters.starred ? { primary: true } : { secondary: true })} onClick={() => updateFilters({ starred: !filters.starred })}>
                    Starred
                  </Button>
                  <Button small {...(filters.shared ? { primary: true } : { secondary: true })} onClick={() => updateFilters({ shared: !filters.shared })}>
                    Shared
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Toggle */}
      {onViewModeChange && viewMode && (
        <div style={{ display: 'flex', border: '1px solid #e1e5e9', borderRadius: '8px', padding: '4px', backgroundColor: '#f8f9fa', marginLeft: '8px' }}>
          <Button {...(viewMode === 'grid' ? { primary: true } : { secondary: true })} onClick={() => onViewModeChange('grid')} style={{ height: '32px', width: '32px', padding: 0, minWidth: '32px' }}>
            <IconApps24 />
          </Button>
          <Button {...(viewMode === 'list' ? { primary: true } : { secondary: true })} onClick={() => onViewModeChange('list')} style={{ height: '32px', width: '32px', padding: 0, minWidth: '32px' }}>
            <IconList24 />
          </Button>
        </div>
      )}
    </div>
  );
} 
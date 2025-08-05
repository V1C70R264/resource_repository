import { useState } from "react";
import { Search, Filter, X, Calendar, Tag, User, Star, Share2, Grid3X3, List } from "lucide-react";
import { DHIS2Button, DHIS2Input } from "@/components/ui/dhis2-components";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
    <div className="flex items-center gap-2 min-w-0">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none z-10" />
        <div className="relative">
          <DHIS2Input
            type="text"
            placeholder="Search files, folders, and content..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.value })}
            className="pl-10 pr-10 w-full"
          />
          {filters.query && (
            <button
              onClick={() => updateFilters({ query: "" })}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50 rounded flex items-center justify-center"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <DHIS2Button
            {...(hasActiveFilters ? { primary: true } : { secondary: true })}
            small
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {[
                  filters.fileTypes.length,
                  filters.tags.length,
                  filters.owners.length,
                  filters.starred ? 1 : 0,
                  filters.shared ? 1 : 0,
                  filters.dateRange.start ? 1 : 0,
                  filters.dateRange.end ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </DHIS2Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Search Filters</h4>
              {hasActiveFilters && (
                <DHIS2Button
                  secondary
                  small
                  onClick={clearFilters}
                >
                  Clear All
                </DHIS2Button>
              )}
            </div>

            {/* File Types */}
            <div className="space-y-2">
              <label className="text-sm font-medium">File Types</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableFileTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.fileTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
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
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm cursor-pointer"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
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
                    <label
                      htmlFor={`tag-${tag}`}
                      className="text-sm cursor-pointer"
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Owners */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Owners</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableOwners.map((owner) => (
                  <div key={owner} className="flex items-center space-x-2">
                    <Checkbox
                      id={`owner-${owner}`}
                      checked={filters.owners.includes(owner)}
                      onCheckedChange={(checked) => {
                        if (checked) {
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
                    <label
                      htmlFor={`owner-${owner}`}
                      className="text-sm cursor-pointer"
                    >
                      {owner}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.start || ""}
                    onChange={(e) =>
                      updateFilters({
                        dateRange: { ...filters.dateRange, start: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.end || ""}
                    onChange={(e) =>
                      updateFilters({
                        dateRange: { ...filters.dateRange, end: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="starred"
                    checked={filters.starred}
                    onCheckedChange={(checked) =>
                      updateFilters({ starred: checked as boolean })
                    }
                  />
                  <label htmlFor="starred" className="text-sm cursor-pointer">
                    Starred
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shared"
                    checked={filters.shared}
                    onCheckedChange={(checked) =>
                      updateFilters({ shared: checked as boolean })
                    }
                  />
                  <label htmlFor="shared" className="text-sm cursor-pointer">
                    Shared
                  </label>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* View Toggle - Only show if onViewModeChange is provided */}
      {onViewModeChange && viewMode && (
        <div className="flex border border-border rounded-lg p-1 bg-muted/50 ml-2">
          <DHIS2Button
            primary={viewMode === 'grid'}
            small
            onClick={() => onViewModeChange('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="w-4 h-4" />
          </DHIS2Button>
          <DHIS2Button
            primary={viewMode === 'list'}
            small
            onClick={() => onViewModeChange('list')}
            className="h-8 w-8 p-0"
          >
            <List className="w-4 h-4" />
          </DHIS2Button>
        </div>
      )}
    </div>
  );
} 
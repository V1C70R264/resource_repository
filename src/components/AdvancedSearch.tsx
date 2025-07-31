import { useState } from "react";
import { Search, Filter, X, Calendar, Tag, User, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Calendar as CalendarIcon } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SearchFilters } from "@/lib/types";

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags: string[];
  availableFileTypes: string[];
  availableOwners: string[];
}

export function AdvancedSearch({
  filters,
  onFiltersChange,
  availableTags,
  availableFileTypes,
  availableOwners,
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
    <div className="flex items-center gap-2">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search files, folders, and content..."
          value={filters.query}
          onChange={(e) => updateFilters({ query: e.target.value })}
          className="pl-10 pr-4"
        />
        {filters.query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateFilters({ query: "" })}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
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
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Search Filters</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* File Types */}
            <div className="space-y-2">
              <label className="text-sm font-medium">File Types</label>
              <div className="grid grid-cols-2 gap-2">
                {availableFileTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.fileTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        const newTypes = checked
                          ? [...filters.fileTypes, type]
                          : filters.fileTypes.filter((t) => t !== type);
                        updateFilters({ fileTypes: newTypes });
                      }}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
              <div className="flex flex-wrap gap-1">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const newTags = filters.tags.includes(tag)
                        ? filters.tags.filter((t) => t !== tag)
                        : [...filters.tags, tag];
                      updateFilters({ tags: newTags });
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">From</label>
                  <Input
                    type="date"
                    value={filters.dateRange.start || ""}
                    onChange={(e) =>
                      updateFilters({
                        dateRange: { ...filters.dateRange, start: e.target.value },
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">To</label>
                  <Input
                    type="date"
                    value={filters.dateRange.end || ""}
                    onChange={(e) =>
                      updateFilters({
                        dateRange: { ...filters.dateRange, end: e.target.value },
                      })
                    }
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Owners */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Owners</label>
              <div className="grid grid-cols-2 gap-2">
                {availableOwners.map((owner) => (
                  <div key={owner} className="flex items-center space-x-2">
                    <Checkbox
                      id={`owner-${owner}`}
                      checked={filters.owners.includes(owner)}
                      onCheckedChange={(checked) => {
                        const newOwners = checked
                          ? [...filters.owners, owner]
                          : filters.owners.filter((o) => o !== owner);
                        updateFilters({ owners: newOwners });
                      }}
                    />
                    <label
                      htmlFor={`owner-${owner}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {owner}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Filters</label>
              <div className="flex gap-2">
                <Button
                  variant={filters.starred ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ starred: !filters.starred })}
                  className="gap-1"
                >
                  <Star className="w-3 h-3" />
                  Starred
                </Button>
                <Button
                  variant={filters.shared ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ shared: !filters.shared })}
                  className="gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  Shared
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 
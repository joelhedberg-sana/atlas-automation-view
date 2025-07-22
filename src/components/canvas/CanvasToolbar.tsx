import { useState } from "react";
import { Search, Filter, Users, Download, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { EnhancedFlow } from "@/lib/enhanced-data-types";

interface CanvasToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: {
    departments: string[];
    tools: string[];
    status: string[];
  };
  onFiltersChange: (filters: any) => void;
  selectedFlows: string[];
  onBulkAction: (action: string) => void;
  onCreateFlow: () => void;
}

export function CanvasToolbar({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  selectedFlows,
  onBulkAction,
  onCreateFlow,
}: CanvasToolbarProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const clearFilters = () => {
    onFiltersChange({
      departments: [],
      tools: [],
      status: [],
    });
    setActiveFilters([]);
  };

  const toggleFilter = (category: string, value: string) => {
    const newFilters = { ...filters };
    const categoryFilters = newFilters[category as keyof typeof filters];
    
    if (categoryFilters.includes(value)) {
      newFilters[category as keyof typeof filters] = categoryFilters.filter(f => f !== value);
    } else {
      newFilters[category as keyof typeof filters] = [...categoryFilters, value];
    }
    
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-card border-b p-4 space-y-4">
      {/* Top Row: Search, Filters, Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flows, tools, departments..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filters.departments.length + filters.tools.length + filters.status.length > 0) && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {filters.departments.length + filters.tools.length + filters.status.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
              {['sales', 'marketing', 'support', 'operations'].map((dept) => (
                <DropdownMenuCheckboxItem
                  key={dept}
                  checked={filters.departments.includes(dept)}
                  onCheckedChange={() => toggleFilter('departments', dept)}
                >
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Tool</DropdownMenuLabel>
              {['zapier', 'salesforce', 'hubspot', 'slack'].map((tool) => (
                <DropdownMenuCheckboxItem
                  key={tool}
                  checked={filters.tools.includes(tool)}
                  onCheckedChange={() => toggleFilter('tools', tool)}
                >
                  {tool.charAt(0).toUpperCase() + tool.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              {['active', 'inactive', 'duplicate', 'orphan'].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => toggleFilter('status', status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearFilters}>
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Group Management */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Groups
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Group by Department</DropdownMenuItem>
              <DropdownMenuItem>Group by Tool</DropdownMenuItem>
              <DropdownMenuItem>Group by Business Value</DropdownMenuItem>
              <DropdownMenuItem>Group by Owner</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Clear Grouping</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={onCreateFlow} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Flow
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedFlows.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
          <span className="text-sm font-medium">
            {selectedFlows.length} flow{selectedFlows.length !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onBulkAction('enable')}>
              Enable
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('disable')}>
              Disable
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('duplicate')}>
              Duplicate
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('export')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onBulkAction('delete')}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.departments.length + filters.tools.length + filters.status.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.departments.map((dept) => (
            <Badge key={`dept-${dept}`} variant="secondary" className="text-xs">
              Department: {dept}
              <button 
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                onClick={() => toggleFilter('departments', dept)}
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.tools.map((tool) => (
            <Badge key={`tool-${tool}`} variant="secondary" className="text-xs">
              Tool: {tool}
              <button 
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                onClick={() => toggleFilter('tools', tool)}
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.status.map((status) => (
            <Badge key={`status-${status}`} variant="secondary" className="text-xs">
              Status: {status}
              <button 
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                onClick={() => toggleFilter('status', status)}
              >
                ×
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
import { ChevronRight, Home } from "lucide-react";
import { DHIS2Button } from "@/components/ui/dhis2-components";

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <DHIS2Button
        secondary
        small
        className="h-8 px-2 hover:bg-muted/50"
        onClick={() => onNavigate('/')}
      >
        <Home className="w-4 h-4" />
      </DHIS2Button>
      
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/50" />
          <DHIS2Button
            secondary
            small
            className={`h-8 px-2 hover:bg-muted/50 ${
              index === items.length - 1 
                ? 'text-foreground font-medium pointer-events-none' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => index < items.length - 1 && onNavigate(item.path)}
          >
            {item.name}
          </DHIS2Button>
        </div>
      ))}
    </nav>
  );
}
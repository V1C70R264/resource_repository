import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 hover:bg-muted/50"
        onClick={() => onNavigate('/')}
      >
        <Home className="w-4 h-4" />
      </Button>
      
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/50" />
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 hover:bg-muted/50 ${
              index === items.length - 1 
                ? 'text-foreground font-medium pointer-events-none' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => index < items.length - 1 && onNavigate(item.path)}
          >
            {item.name}
          </Button>
        </div>
      ))}
    </nav>
  );
}
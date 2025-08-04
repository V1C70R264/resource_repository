import * as React from "react"
import { Button, Input, Card, DropdownButton, MenuItem } from "@dhis2/ui"
import { cn } from "@/lib/utils"

// Re-export official DHIS2 UI components
export { 
  Button as DHIS2Button, 
  Input as DHIS2Input, 
  Card as DHIS2Card,
  DropdownButton as DHIS2DropdownButton,
  MenuItem as DHIS2MenuItem
} from "@dhis2/ui"

// DHIS2 Dropdown Menu Components
const DHIS2DropdownMenu: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("dhis2-dropdown-menu", className)}>
    {children}
  </div>
)

const DHIS2DropdownMenuTrigger: React.FC<{ 
  children: React.ReactNode; 
  asChild?: boolean;
  className?: string;
}> = ({ children, asChild, className }) => {
  if (asChild) {
    return <>{children}</>
  }
  return (
    <div className={cn("dhis2-dropdown-menu-trigger", className)}>
      {children}
    </div>
  )
}

const DHIS2DropdownMenuContent: React.FC<{ 
  children: React.ReactNode; 
  align?: 'start' | 'center' | 'end';
  className?: string;
}> = ({ children, align = 'start', className }) => (
  <div className={cn(
    "dhis2-dropdown-menu-content bg-background border border-border rounded-md shadow-lg p-1 min-w-[8rem] z-50",
    align === 'end' && "right-0",
    align === 'center' && "left-1/2 transform -translate-x-1/2",
    className
  )}>
    {children}
  </div>
)

const DHIS2DropdownMenuItem: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "dhis2-dropdown-menu-item relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 w-full text-left",
      className
    )}
  >
    {children}
  </button>
)

const DHIS2DropdownMenuSeparator: React.FC<{ 
  className?: string;
}> = ({ className }) => (
  <div className={cn("dhis2-dropdown-menu-separator -mx-1 my-1 h-px bg-border", className)} />
)

// DHIS2 Layout Components
const DHIS2Header: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <header className={cn("dhis2-header", className)}>
    {children}
  </header>
)

const DHIS2Sidebar: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <aside className={cn("dhis2-sidebar w-64", className)}>
    {children}
  </aside>
)

const DHIS2Main: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <main className={cn("dhis2-main", className)}>
    {children}
  </main>
)

// DHIS2 Icon Components
const DHIS2Icon: React.FC<{ 
  icon: React.ReactNode; 
  size?: 'small' | 'medium' | 'large';
  className?: string;
}> = ({ icon, size = 'medium', className }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  }
  
  return (
    <div className={cn("dhis2-icon", sizeClasses[size], className)}>
      {icon}
    </div>
  )
}

// DHIS2 Badge Component
const DHIS2Badge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}> = ({ children, variant = 'default', className }) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground'
  }
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}

// Export all DHIS2 components
export {
  DHIS2Header,
  DHIS2Sidebar,
  DHIS2Main,
  DHIS2Icon,
  DHIS2Badge,
  DHIS2DropdownMenu,
  DHIS2DropdownMenuTrigger,
  DHIS2DropdownMenuContent,
  DHIS2DropdownMenuItem,
  DHIS2DropdownMenuSeparator
} 
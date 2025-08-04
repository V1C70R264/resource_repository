# DHIS2 Design System Integration

This project has been integrated with the official [DHIS2 Design System](https://developers.dhis2.org/docs/ui/webcomponents/) to ensure consistency with DHIS2 applications.

## 🎨 Design System Overview

Based on the [DHIS2 Web UI Components documentation](https://developers.dhis2.org/docs/ui/webcomponents/), this project follows:

- **Atomic Design Principles**: Components built from atoms → molecules → organisms
- **Official DHIS2 UI Library**: Using `@dhis2/ui` for core components
- **Consistent Color Palette**: DHIS2 Blue (#0066CC) as primary color
- **Accessibility Standards**: WCAG 2.1 AA compliance
- **Responsive Design**: Mobile-first approach

## 🚀 Available DHIS2 Components

### Core Components

```tsx
import { 
  DHIS2Button, 
  DHIS2Input, 
  DHIS2Card,
  DHIS2Header,
  DHIS2Sidebar,
  DHIS2Main,
  DHIS2Icon,
  DHIS2Badge
} from "@/components/ui/dhis2-components";
```

### Button Variants (Official DHIS2 API)

Based on the [DHIS2 Button documentation](https://developers.dhis2.org/docs/ui/components/button), buttons use boolean props:

```tsx
// Basic button (default for most use cases)
<DHIS2Button>Basic button</DHIS2Button>

// Primary button (most important action on a page)
<DHIS2Button primary>Save Changes</DHIS2Button>

// Secondary button (less important actions)
<DHIS2Button secondary>Cancel</DHIS2Button>

// Destructive button (actions that destroy data)
<DHIS2Button destructive>Delete File</DHIS2Button>

// Destructive secondary (less important destructive actions)
<DHIS2Button destructive secondary>Remove</DHIS2Button>

// Button sizes
<DHIS2Button small>Small button</DHIS2Button>
<DHIS2Button large>Large button</DHIS2Button>

// Button with icon
<DHIS2Button primary icon={<SaveIcon />}>Save</DHIS2Button>

// Loading state
<DHIS2Button primary loading>Loading…</DHIS2Button>

// Disabled state
<DHIS2Button primary disabled>Save</DHIS2Button>
```

### Button Usage Guidelines

| Variant | When to use |
|---------|-------------|
| Basic | Default. Will suit the majority of actions on a page |
| Primary | Use for the most important action on a page, like a "Save data" button in a form. Only use one primary button on a page |
| Secondary | Use for less important actions, usually in combination with other buttons. Can be applied to Destructive |
| Destructive | Only for primary-type actions that will delete or destroy something. Don't use several on a single page |

### Input Components

```tsx
// Text input
<DHIS2Input
  type="text"
  placeholder="Enter search term..."
  value={searchQuery}
  onChange={handleSearchChange}
/>

// Search input with icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" />
  <DHIS2Input
    className="pl-10"
    placeholder="Search files..."
  />
</div>
```

### Card Components

```tsx
<DHIS2Card className="p-6">
  <h3 className="text-lg font-semibold">File Information</h3>
  <p className="text-muted-foreground">File details and metadata</p>
</DHIS2Card>
```

### Layout Components

```tsx
// Header
<DHIS2Header>
  <div className="flex items-center gap-3">
    <img src="/DHIS2.png" alt="DHIS2 Logo" />
    <h1>DHIS2 Resource Repository</h1>
  </div>
</DHIS2Header>

// Sidebar
<DHIS2Sidebar>
  <nav className="p-4">
    {/* Navigation items */}
  </nav>
</DHIS2Sidebar>

// Main content
<DHIS2Main>
  <div className="p-6">
    {/* Main content */}
  </div>
</DHIS2Main>
```

### Badge Components

```tsx
// Status badges
<DHIS2Badge variant="success">Active</DHIS2Badge>
<DHIS2Badge variant="warning">Pending</DHIS2Badge>
<DHIS2Badge variant="destructive">Error</DHIS2Badge>
<DHIS2Badge variant="default">Default</DHIS2Badge>
```

## 🎨 Color System

### Primary Colors
- **DHIS2 Blue**: `#0066CC` (Primary brand color)
- **Success Green**: `#4CAF50` (Success states)
- **Warning Orange**: `#FF9800` (Warning states)
- **Error Red**: `#F44336` (Error states)

### Usage in CSS
```css
/* Using DHIS2 colors */
.btn-primary {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.btn-success {
  background-color: hsl(var(--success));
  color: hsl(var(--success-foreground));
}
```

## 📱 Responsive Design

The design system follows DHIS2's responsive guidelines:

```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <DHIS2Card>Content</DHIS2Card>
</div>
```

## ♿ Accessibility

All components follow DHIS2 accessibility standards:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: WCAG 2.1 AA compliant contrast ratios
- **Focus Indicators**: Clear focus states for all interactive elements

## 🔧 Customization

### Adding Custom DHIS2 Components

```tsx
// Create custom DHIS2 component
export const DHIS2CustomComponent = ({ children, className }) => (
  <div className={cn("dhis2-custom", className)}>
    {children}
  </div>
);
```

### Extending DHIS2 Styles

```css
/* Add custom DHIS2 utility classes */
@layer components {
  .dhis2-custom {
    @apply bg-primary text-primary-foreground rounded-lg p-4;
  }
}
```

## 📚 Best Practices

### 1. Component Usage
- Always use DHIS2 components for consistency
- Follow the atomic design pattern
- Maintain accessibility standards

### 2. Styling
- Use DHIS2 color variables
- Follow DHIS2 spacing guidelines
- Implement responsive design

### 3. Icons
- Use Lucide React icons (already integrated)
- Maintain consistent icon sizes
- Provide proper alt text for accessibility

### 4. Typography
- Use DHIS2 font hierarchy
- Maintain proper contrast ratios
- Follow responsive text sizing

## 🎯 Integration with Official DHIS2 UI

This project now uses the official DHIS2 UI library directly:

```bash
npm install @dhis2/ui @dhis2/ui-icons
```

### Available Official Components
- Alert bar
- Button
- Calendar Input
- Card
- Checkbox
- Chip
- Data table
- File input
- Input
- Loader
- Menu
- Modal
- Notice box
- Pagination
- Popover
- Radio
- Select
- Switch
- Tabs
- Tag
- Tooltip

## 🔗 Resources

- [DHIS2 Design System Documentation](https://developers.dhis2.org/design-system/)
- [DHIS2 Web UI Components](https://developers.dhis2.org/docs/ui/webcomponents/)
- [DHIS2 Button Component](https://developers.dhis2.org/docs/ui/components/button)
- [DHIS2 UI Library on NPM](https://www.npmjs.com/package/@dhis2/ui)

## 📝 Notes

- All components follow DHIS2 design principles
- Color palette matches official DHIS2 branding
- Components are fully accessible and responsive
- Integration maintains compatibility with existing shadcn/ui components
- **Now using official DHIS2 UI library directly** - exact same API as documentation

---

*This design system integration ensures your DHIS2 Resource Repository follows official DHIS2 design standards and provides a consistent user experience.* 
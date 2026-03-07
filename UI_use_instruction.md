# UI Style Guide & Instructions

## Design System Overview

This project is a **WhatsApp-style CRM dashboard** for managing broadcasts, contacts, templates, and accounts. The visual identity uses green/teal accents inspired by WhatsApp, with a dark sidebar and light content area.

---

## Typography

- **Display / Headings:** `Space Grotesk` (font-family: `var(--font-display)`) — used for all `h1`–`h6` tags automatically via CSS.
- **Body / UI text:** `Inter` (font-family: `var(--font-body)`) — applied to `body` by default.
- Use Tailwind classes `font-display` and `font-body` when overriding manually.

---

## Color Palette

**CRITICAL: Never use raw color values in components. Always use semantic Tailwind tokens.**

### Core Tokens (HSL in `index.css`, mapped in `tailwind.config.ts`)

| Token | Usage |
|---|---|
| `bg-background` / `text-foreground` | Main page background and text |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `bg-primary` / `text-primary-foreground` | Primary buttons, active states |
| `bg-secondary` / `text-secondary-foreground` | Secondary buttons, tags |
| `bg-muted` / `text-muted-foreground` | Subdued backgrounds, helper text |
| `bg-accent` / `text-accent-foreground` | Highlighted rows, hover states |
| `bg-destructive` / `text-destructive-foreground` | Delete buttons, error states |

### WhatsApp Brand Tokens

| Token | Tailwind Class | Usage |
|---|---|---|
| `--wa-green` | `bg-wa-green`, `text-wa-green` | Primary brand green |
| `--wa-green-light` | `bg-wa-green-light` | Light green backgrounds, badges |
| `--wa-green-dark` | `text-wa-green-dark` | Dark green text on light bg |
| `--wa-teal` | `bg-wa-teal` | Gradient accents |
| `--wa-emerald` | `bg-wa-emerald` | Secondary green accents |
| `--wa-amber` | `bg-wa-amber` | Warning states, pending indicators |
| `--wa-amber-light` | `bg-wa-amber-light` | Light warning backgrounds |

### Gradients & Shadows (CSS utilities)

| Class | Usage |
|---|---|
| `gradient-primary` | Green-to-teal gradient for CTAs |
| `gradient-hero` | Dark gradient for hero sections |
| `gradient-card` | Subtle white-to-gray card gradient |
| `shadow-glow` | Green glow effect for emphasis |
| `text-gradient` | Gradient text (green-to-teal) |

---

## Sidebar

- **Dark theme** (`--sidebar-background: 160 20% 8%`) — always dark regardless of page theme.
- Use `sidebar-*` tokens for all sidebar elements.
- Navigation uses `NavLink` component with icons from `lucide-react`.
- Sidebar collapses to icon-only mode; conditionally render text labels using `useSidebar()` hook's `state` property.

---

## Component Library

Built on **shadcn/ui** components. All components are in `src/components/ui/`.

### Key Components Used

- `Button` — variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- `Card`, `CardHeader`, `CardTitle`, `CardContent` — main content containers
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` — modal dialogs
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` — dropdowns
- `Input`, `Label`, `Textarea` — form elements
- `Checkbox` — multi-select lists
- `Badge` — status indicators and tags
- `Table`, `TableHeader`, `TableRow`, `TableCell` — data tables
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` — tabbed interfaces
- `Progress` — progress bars
- `Popover` — floating panels
- `Sheet` — sliding panels (mobile sidebar)
- `Tooltip` — hover hints

### Dialog Best Practices

- Always add `max-h-[85vh] overflow-y-auto` to `DialogContent` for long forms.
- Use `DialogHeader` + `DialogTitle` + `DialogDescription` for accessibility.
- Place action buttons in `DialogFooter`.

---

## Layout

- **`DashboardLayout`** wraps all pages — provides sidebar + header + main content area.
- Main content uses `<main className="flex-1 overflow-auto p-6">`.
- Header height: `h-14` with `border-b bg-card`.
- Use `SidebarProvider` → `AppSidebar` + content pattern.

### Common Page Structure

```tsx
<DashboardLayout>
  <div className="space-y-6">
    {/* Page header */}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Page Title</h1>
      <Button>Action</Button>
    </div>
    
    {/* Content */}
    <Card>
      <CardHeader>
        <CardTitle>Section</CardTitle>
      </CardHeader>
      <CardContent>
        {/* ... */}
      </CardContent>
    </Card>
  </div>
</DashboardLayout>
```

---

## Animations

- Use **framer-motion** for enter/exit animations.
- Common pattern: `<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>`
- Keep animations subtle — 0.2–0.3s duration.
- shadcn dialogs/popovers have built-in Radix animations (don't add extra).

---

## Icons

- Use **lucide-react** exclusively.
- Standard size in buttons/menus: `className="h-4 w-4"`.
- Sidebar icons: `size={20}`.

---

## Data Separator Convention

- When users input multiple values (e.g., contact variables), use **semicolon (`;`)** as the separator, NOT comma.
- Example: `+79001234567; Москва; 10%`

---

## General Rules

1. **All colors must use semantic tokens** — no `text-white`, `bg-black`, `text-green-500`, etc.
2. **All new colors must be added to `index.css` as CSS variables and to `tailwind.config.ts`.**
3. **Responsive design** — use Tailwind breakpoints (`sm:`, `md:`, `lg:`).
4. **Dark mode** — ensure tokens work in `.dark` class (defined in `index.css`).
5. **Toast notifications** — use `sonner` library's `toast()` for success/error feedback.
6. **Form validation** — validate before submit, show toast on error.
7. **State management** — use React `useState` for local state; `@tanstack/react-query` for server data.
8. **Routing** — `react-router-dom` v6 with routes defined in `App.tsx`.

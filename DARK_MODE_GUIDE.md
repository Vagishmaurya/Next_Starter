# Dark Mode / Light Mode Implementation

## Overview

This application implements a robust dark/light theme system using `next-themes` with persistent user preference.

## Key Features

- **System-aware**: Respects OS dark mode preference by default
- **Persistent**: User theme choice saved to localStorage
- **No Flash**: Theme hydration prevents flash on page load
- **SSR Safe**: Works correctly with server-side rendering
- **Full Coverage**: All components use CSS variables for theming

## How It Works

### 1. ThemeProvider Setup

Located in `src/components/providers/theme-provider.tsx`:

\`\`\`tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
\`\`\`

- `attribute="class"`: Sets class on `<html>` element
- `defaultTheme="system"`: Uses OS preference initially
- `enableSystem`: Watches for OS dark mode changes

### 2. CSS Variables

All colors defined as CSS variables in `app/globals.css`:

**Light Mode** (`:root`):
\`\`\`css
--background: oklch(1 0 0);        /* White */
--foreground: oklch(0.145 0 0);    /* Dark gray */
--primary: oklch(0.205 0 0);       /* Dark primary */
--primary-foreground: oklch(0.985 0 0); /* Light foreground */
\`\`\`

**Dark Mode** (`.dark`):
\`\`\`css
--background: oklch(0.145 0 0);    /* Dark gray */
--foreground: oklch(0.985 0 0);    /* White */
--primary: oklch(0.985 0 0);       /* Light primary */
--primary-foreground: oklch(0.205 0 0); /* Dark foreground */
\`\`\`

### 3. Theme Toggle Component

Located in `src/components/theme-toggle.tsx`:

\`\`\`tsx
<Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  <Sun /> {/* Shown in light mode */}
  <Moon /> {/* Shown in dark mode */}
</Button>
\`\`\`

Features:
- Smooth icon transitions
- Proper hydration handling
- Accessibility labels

### 4. Using Theme Colors

Always use CSS variables or Tailwind classes:

**Good:**
\`\`\`tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Click me
  </button>
</div>
\`\`\`

**Bad:**
\`\`\`tsx
<div className="bg-white text-black">
  <button className="bg-blue-600">
    Click me
  </button>
</div>
\`\`\`

## Adding New Colors

To add theme-aware colors:

1. Add CSS variables in `app/globals.css`:

\`\`\`css
:root {
  --success: oklch(0.5 0.2 142); /* Light mode */
}

.dark {
  --success: oklch(0.7 0.2 142); /* Dark mode */
}
\`\`\`

2. Add Tailwind theme extension in `globals.css`:

\`\`\`css
@theme inline {
  --color-success: var(--success);
}
\`\`\`

3. Use in components:

\`\`\`tsx
<div className="bg-success text-success-foreground">Success!</div>
\`\`\`

## Testing Theme

### Manual Testing

1. Click theme toggle in navbar
2. Verify all elements change colors
3. Refresh page - theme should persist
4. Clear localStorage - should return to system preference

### Checking OS Preference

1. Open browser DevTools
2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
3. Search "emulate CSS media feature"
4. Toggle dark mode

### Debugging

In browser console:

\`\`\`javascript
// Get current theme
document.documentElement.getAttribute('class')

// Get CSS variable value
getComputedStyle(document.documentElement).getPropertyValue('--primary')

// Get next-themes data
JSON.parse(localStorage.getItem('theme-store'))
\`\`\`

## Common Issues

### Theme Flashes on Page Load

**Problem**: Page loads in wrong theme, then switches.

**Solution**: Already handled by next-themes with `suppressHydrationWarning` in html tag.

### Colors Not Changing

**Problem**: Some colors don't switch between light/dark modes.

**Solution**: Ensure component uses CSS variables:
- ✅ `className="bg-primary"`
- ❌ `className="bg-blue-600"`

### Theme Preference Not Saved

**Problem**: Theme resets on page refresh.

**Solution**: Check localStorage is enabled and no errors in console.

## Best Practices

1. **Always use CSS variables** for colors
2. **Test in both themes** before committing
3. **Use proper contrast** for accessibility
4. **Animate transitions** smoothly with Tailwind
5. **Consider colorblind users** when choosing palette
6. **Test with system preference** changes

## Tailwind Integration

All semantic colors available in Tailwind:

\`\`\`tsx
// Background
<div className="bg-background text-foreground">

// Cards
<div className="bg-card text-card-foreground">

// UI Elements
<button className="bg-primary text-primary-foreground">
<button className="bg-secondary text-secondary-foreground">

// States
<button className="bg-destructive text-destructive-foreground">
<input className="border-input bg-input">

// Accents
<div className="bg-accent text-accent-foreground">
<div className="text-muted-foreground">
\`\`\`

## Performance

- **No CSS-in-JS**: Uses plain CSS variables
- **No Component Overhead**: Minimal re-renders
- **Small Bundle**: next-themes is ~2.5KB
- **Fast Theme Switch**: Instant color updates

## Future Enhancements

Potential improvements:
- Custom theme colors per user
- Multiple theme options beyond light/dark
- Smooth theme transitions
- Theme scheduling (light during day, dark at night)

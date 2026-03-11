

## Problem

The light mode is not functional because:

1. **`:root` CSS variables are dark theme colors** -- both `:root` and `.dark` define nearly identical dark color schemes. The `:root` should define light theme colors.
2. **`color-scheme: dark` is hardcoded** on line 100 of `index.css`, forcing dark mode regardless of the class toggle.
3. **Hardcoded dark colors in component utilities** -- classes like `.card-tech`, `.badge-*`, `.bg-tech-particles` use hardcoded dark HSL values and dark-specific rgba colors instead of CSS variables.

## Plan

### 1. Define proper light theme colors in `:root` (src/index.css)

Replace the `:root` block (lines 9-52) with actual light theme values:
- `--background`: white/light gray (e.g., `0 0% 100%`)
- `--foreground`: dark text (e.g., `20 14% 10%`)
- `--card`: light card background (e.g., `0 0% 100%`)
- `--card-foreground`: dark text
- `--muted`: light gray tones
- `--border`: light border colors
- `--sidebar-background`: light sidebar
- Keep `--primary` orange consistent across both themes

### 2. Fix `color-scheme` (src/index.css, line 100)

Change from hardcoded `color-scheme: dark` to:
```css
html { color-scheme: light; }
html.dark { color-scheme: dark; }
```

### 3. Add dark-mode variants to hardcoded component styles (src/index.css)

Update `.card-tech`, `.badge-*`, `.shadow-tech`, `.bg-tech-particles` to use CSS variables or add light-appropriate versions. For example, `.card-tech` should use `hsl(var(--card))` instead of hardcoded dark HSL values.

### 4. Fix default dark mode initialization (src/components/AppSidebar.tsx)

The `useLocalStorage` default for `darkMode` is `true`. This is fine, but ensure the light mode actually renders correctly when toggled off.

No changes needed to the toggle logic in `AppSidebar.tsx` or `ProfileCard.tsx` -- the class-based toggle already works, the CSS just needs proper light values.


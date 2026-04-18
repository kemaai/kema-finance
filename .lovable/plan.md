

## Fix Desktop Card Truncation

The dashboard cards on desktop are truncating values like "R$ 631,..." and "R$ 8.11..." because `DashboardCard.tsx` uses `truncate` on the value/subValue, and the 5-card row at ~929px width gives each card too little space.

### Root Cause

In `src/components/DashboardCard.tsx`:
- `<h3>` value uses `truncate` always → cuts off "R$ 631,250.00"
- `<p>` subValue uses `truncate` always → cuts off "Sites: R$ 0 • Inst: R$..."
- Title also uses `truncate`
- Font size `text-lg md:text-2xl` is too large for narrow desktop cards

The memory note `ui/dashboard-desktop-layout-optimization` mentions responsive classes `md:whitespace-normal md:overflow-visible` should already exist — but the current file does NOT have them.

### Fix (single file: `src/components/DashboardCard.tsx`)

1. Remove `truncate` on desktop for value, subValue, and title — allow wrapping with `md:whitespace-normal md:break-words`
2. Slightly reduce desktop value font size to `md:text-xl lg:text-2xl` to better fit at narrow desktop widths
3. Keep mobile behavior identical (`truncate` + `text-lg` on mobile preserved via base classes)
4. Allow value `<h3>` to use `tabular-nums` for cleaner number alignment

### Result
- Mobile: unchanged (truncated, compact)
- Desktop: full values visible, wrapping naturally if needed, no horizontal overflow

Only `src/components/DashboardCard.tsx` is modified. No layout/grid changes to `Dashboard.tsx`.


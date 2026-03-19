

## Update M² Price from R$20 to R$24

The constant `20` (price per m²) is hardcoded in 5 files across 10 occurrences. All need to be updated to `24`.

### Files to Change

1. **src/components/InstalacaoForm.tsx** (lines 96, 186, and the label text ~line 190)
   - `formData.valor_total / 20` → `/ 24`
   - `* 20` → `* 24`
   - Label text: `R$ 20,00 por m²` → `R$ 24,00 por m²`

2. **src/components/InstalacaoCard.tsx** (line 132)
   - `instalacao.valor_total / 20` → `/ 24`

3. **src/hooks/useQuinzenaFilter.tsx** (lines 58, 73)
   - Both `/ 20` → `/ 24`

4. **src/pages/Dashboard.tsx** (line 118)
   - `/ 20` → `/ 24`

5. **src/pages/Relatorios.tsx** (lines 122, 201, 335, 800)
   - All `/ 20` → `/ 24`

### Technical Note
Ideally this constant should be extracted to a shared constant (e.g., `PRECO_POR_M2 = 24`), but to minimize risk the plan will do a direct replacement across all files. A future refactor could centralize it.




## Crop de avatar antes do upload

### Objetivo
Permitir recortar a foto em formato circular/quadrado antes de enviar como avatar na página `/perfil`, usando `react-easy-crop`.

### Dependência
- Adicionar `react-easy-crop`

### Mudanças

**1. Novo componente: `src/components/AvatarCropDialog.tsx`**

Modal (Dialog do shadcn) com:
- Área de crop quadrada (1:1) usando `<Cropper>` do react-easy-crop, com `cropShape="round"` e `showGrid={false}`
- Slider (shadcn) para zoom (1x → 3x)
- Botões "Cancelar" e "Salvar"
- Função utilitária `getCroppedBlob(imageSrc, croppedAreaPixels)` que usa canvas para gerar um Blob JPEG (qualidade 0.9, max 512x512) — função local no componente

Props:
```ts
{
  open: boolean;
  imageSrc: string;            // dataURL ou objectURL
  onClose: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
}
```

**2. Ajuste em `src/pages/Perfil.tsx`**

Fluxo atual: `handleAvatarChange` faz upload direto.
Novo fluxo:
- `handleAvatarChange` lê o arquivo, gera `URL.createObjectURL`, abre o `AvatarCropDialog` (estado `cropSrc` + `cropOpen`)
- Função `handleCropConfirm(blob)` faz o upload (extraindo a lógica atual de upload), mostra spinner durante upload, fecha o dialog
- Manter validações existentes (5MB, tipo image/*) antes de abrir o crop
- Liberar objectURL com `URL.revokeObjectURL` após uso

Sem alterações em: bucket, RLS, hook `useAuth`, rotas.

### Arquivos
- **Criar**: `src/components/AvatarCropDialog.tsx`
- **Editar**: `src/pages/Perfil.tsx`
- **Adicionar dependência**: `react-easy-crop`


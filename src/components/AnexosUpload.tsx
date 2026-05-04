import React, { useRef, useState } from 'react';
import { Upload, FileText, FileSpreadsheet, FileImage, File as FileIcon, Trash2, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useInstalacaoAnexos,
  ACCEPT_ATTR,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  type InstalacaoAnexo,
} from '@/hooks/useInstalacaoAnexos';
import { toast } from 'sonner';

interface AnexosUploadProps {
  instalacaoId: string | null;
  /** Quando não há instalacaoId ainda (criação), arquivos ficam pendentes em memória */
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
}

const iconForMime = (mime: string) => {
  if (mime.startsWith('image/')) return FileImage;
  if (mime === 'application/pdf') return FileText;
  if (mime.includes('sheet') || mime.includes('excel') || mime === 'text/csv') return FileSpreadsheet;
  if (mime.includes('word')) return FileText;
  return FileIcon;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const AnexosUpload: React.FC<AnexosUploadProps> = ({
  instalacaoId,
  pendingFiles = [],
  onPendingFilesChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { anexos, isLoading, upload, isUploading, remove, getSignedUrl } =
    useInstalacaoAnexos(instalacaoId);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const validateAndCollect = (files: File[]) => {
    const valid: File[] = [];
    for (const f of files) {
      if (!ALLOWED_MIME_TYPES.includes(f.type)) {
        toast.error(`Formato não permitido: ${f.name}`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`"${f.name}" excede o limite de 10 MB`);
        continue;
      }
      valid.push(f);
    }
    return valid;
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = validateAndCollect(Array.from(fileList));
    if (files.length === 0) return;

    if (instalacaoId) {
      try {
        await upload(files);
      } catch {
        // erro já notificado pelo hook
      }
    } else if (onPendingFilesChange) {
      onPendingFilesChange([...pendingFiles, ...files]);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleView = async (anexo: InstalacaoAnexo) => {
    try {
      const url = await getSignedUrl(anexo.file_path, 60);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Não foi possível abrir o arquivo');
    }
  };

  const handleShare = async (anexo: InstalacaoAnexo) => {
    setSharingId(anexo.id);
    try {
      const url = await getSignedUrl(anexo.file_path, 60 * 60 * 24 * 7); // 7 dias
      const shareData = {
        title: anexo.file_name,
        text: `Anexo: ${anexo.file_name}`,
        url,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err: any) {
          if (err?.name === 'AbortError') return;
        }
      }
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado! Válido por 7 dias.');
    } catch {
      toast.error('Não foi possível compartilhar');
    } finally {
      setSharingId(null);
    }
  };

  const removePending = (idx: number) => {
    if (!onPendingFilesChange) return;
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Enviando...' : 'Anexar arquivos'}
      </Button>
      <p className="text-xs text-muted-foreground">
        Imagens, PDF, planilhas (xls, xlsx, csv) ou Word (doc, docx). Máx. 10 MB cada.
      </p>

      {/* Pendentes (criação) */}
      {!instalacaoId && pendingFiles.length > 0 && (
        <ul className="space-y-2">
          {pendingFiles.map((f, idx) => {
            const Icon = iconForMime(f.type);
            return (
              <li
                key={`${f.name}-${idx}`}
                className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30"
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-foreground">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(f.size)} · pendente</p>
                </div>
                <button
                  type="button"
                  onClick={() => removePending(idx)}
                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                  aria-label="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Já enviados */}
      {instalacaoId && (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Carregando anexos...</p>
          ) : anexos.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum anexo.</p>
          ) : (
            <ul className="space-y-2">
              {anexos.map((a) => {
                const Icon = iconForMime(a.mime_type);
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate text-foreground">{a.file_name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(a.file_size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleView(a)}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded"
                      aria-label="Visualizar"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(a)}
                      disabled={sharingId === a.id}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded disabled:opacity-50"
                      aria-label="Compartilhar"
                      title="Compartilhar"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remover "${a.file_name}"?`)) remove(a);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                      aria-label="Remover"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
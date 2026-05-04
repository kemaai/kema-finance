import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface InstalacaoAnexo {
  id: string;
  instalacao_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ACCEPT_ATTR =
  'image/jpeg,image/png,image/webp,image/gif,application/pdf,.xls,.xlsx,.csv,.doc,.docx';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const BUCKET = 'instalacao-anexos';

const sanitizeName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);

export const useInstalacaoAnexos = (instalacaoId: string | null | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const enabled = !!user && !!instalacaoId;

  const query = useQuery({
    queryKey: ['instalacao-anexos', instalacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instalacao_anexos')
        .select('*')
        .eq('instalacao_id', instalacaoId!)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as InstalacaoAnexo[];
    },
    enabled,
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!user || !instalacaoId) throw new Error('Não autenticado');
      const uploaded: InstalacaoAnexo[] = [];
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`"${file.name}" excede o limite de 10 MB`);
        }
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          throw new Error(`Formato não permitido: ${file.name}`);
        }
        const path = `${user.id}/${instalacaoId}/${crypto.randomUUID()}-${sanitizeName(file.name)}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;

        const { data, error: insErr } = await supabase
          .from('instalacao_anexos')
          .insert({
            instalacao_id: instalacaoId,
            user_id: user.id,
            file_name: file.name,
            file_path: path,
            mime_type: file.type,
            file_size: file.size,
          })
          .select()
          .single();
        if (insErr) {
          await supabase.storage.from(BUCKET).remove([path]);
          throw insErr;
        }
        uploaded.push(data as InstalacaoAnexo);
      }
      return uploaded;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instalacao-anexos', instalacaoId] });
      toast.success('Arquivo(s) anexado(s) com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar arquivo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (anexo: InstalacaoAnexo) => {
      if (!user) throw new Error('Não autenticado');
      await supabase.storage.from(BUCKET).remove([anexo.file_path]);
      const { error } = await supabase
        .from('instalacao_anexos')
        .delete()
        .eq('id', anexo.id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instalacao-anexos', instalacaoId] });
      toast.success('Anexo removido');
    },
    onError: () => toast.error('Erro ao remover anexo'),
  });

  const getSignedUrl = async (path: string, expiresIn = 60) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn);
    if (error || !data) throw error || new Error('Falha ao gerar link');
    return data.signedUrl;
  };

  return {
    anexos: query.data || [],
    isLoading: query.isLoading,
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    remove: deleteMutation.mutate,
    getSignedUrl,
  };
};
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  profileSchema,
  emailUpdateSchema,
  passwordUpdateSchema,
} from '@/lib/validations';

export default function Perfil() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [resending, setResending] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile]);

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isEmailVerified = !!user?.email_confirmed_at;

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo deve ser uma imagem');
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      if (updateError) throw updateError;

      await refreshProfile();
      toast.success('Foto atualizada com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar foto');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const parsed = profileSchema.safeParse({ full_name: fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSavingProfile(true);
    try {
      const trimmed = parsed.data.full_name;
      const firstName = trimmed.split(' ')[0].slice(0, 100);

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: trimmed, first_name: firstName })
        .eq('id', user.id);
      if (error) throw error;

      await refreshProfile();
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      toast.success('Email de verificação enviado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao reenviar verificação');
    } finally {
      setResending(false);
    }
  };

  const handleUpdateEmail = async () => {
    const parsed = emailUpdateSchema.safeParse({ email: newEmail });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: parsed.data.email });
      if (error) throw error;
      toast.success('Verifique seu novo email para confirmar a alteração');
      setNewEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar email');
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    const parsed = passwordUpdateSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) throw error;
      toast.success('Senha alterada com sucesso!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar senha');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas informações pessoais e segurança</p>
        </div>
      </div>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize sua foto e nome</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Avatar'} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Button variant="outline" onClick={handleAvatarClick} disabled={uploadingAvatar}>
                <Camera className="w-4 h-4 mr-2" />
                Alterar foto
              </Button>
              <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              maxLength={100}
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar alterações
          </Button>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>Gerencie seu endereço de email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Email atual</Label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground font-medium">{user?.email}</span>
              {isEmailVerified ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verificado
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400">
                  <AlertCircle className="w-3 h-3 mr-1" /> Não verificado
                </Badge>
              )}
            </div>
            {!isEmailVerified && (
              <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={resending}>
                {resending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Reenviar verificação
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail">Novo email</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="novo@email.com"
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">
              Você receberá um link de confirmação no novo endereço.
            </p>
          </div>

          <Button onClick={handleUpdateEmail} disabled={updatingEmail || !newEmail}>
            {updatingEmail && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Alterar email
          </Button>
        </CardContent>
      </Card>

      {/* Senha */}
      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Altere sua senha de acesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              maxLength={72}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres, incluindo uma maiúscula e um número.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              maxLength={72}
            />
          </div>

          <Button onClick={handleUpdatePassword} disabled={updatingPassword || !password || !confirmPassword}>
            {updatingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Alterar senha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

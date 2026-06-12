import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Sparkles, ShieldCheck, TrendingUp, ArrowLeft } from 'lucide-react';
import kemaIcon from '@/assets/kema-icon.png';

export const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Informe seu email');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error('Erro ao enviar email: ' + error.message);
        return;
      }
      setForgotSent(true);
      toast.success('Email de recuperação enviado!');
    } catch {
      toast.error('Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        toast.error('Erro no login com Google: ' + error.message);
      }
    } catch {
      toast.error('Erro inesperado no login com Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) {
        toast.error('Erro no login: ' + error.message);
        return;
      }
      if (data.user) {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Erro inesperado no login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: formData.fullName },
        },
      });
      if (error) {
        toast.error('Erro no cadastro: ' + error.message);
        return;
      }
      if (data.user) {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        setFormData({ email: '', password: '', fullName: '' });
      }
    } catch (error) {
      toast.error('Erro inesperado no cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background grid lg:grid-cols-2 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px]" />

      {/* LEFT — Branding panel (desktop only) */}
      <aside className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-card via-card to-background border-r border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />

        <div className="relative z-10 flex items-center gap-3">
          <img src={kemaIcon} alt="Logo KemaFinance" width={48} height={48} className="w-12 h-12 object-contain" />
          <span className="text-xl font-bold text-foreground tracking-tight">KemaFinance</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight text-foreground">
              Gestão financeira <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                inteligente
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Controle clientes, serviços, despesas e metas em um só lugar — com IA dedicada à sua saúde financeira.
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            {[
              { icon: Sparkles, label: 'Análise preditiva com KemaFinance AI' },
              { icon: TrendingUp, label: 'Metas inteligentes pelo método 50-30-20' },
              { icon: ShieldCheck, label: 'Dados protegidos com isolamento por usuário' },
            ].map((feat) => (
              <div key={feat.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <feat.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground/90">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} KemaFinance · Todos os direitos reservados
        </div>
      </aside>

      {/* RIGHT — Form */}
      <main className="relative z-10 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile branding */}
          <div className="lg:hidden text-center space-y-3">
            <img src={kemaIcon} alt="Logo KemaFinance" width={72} height={72} className="w-18 h-18 mx-auto object-contain" />
            <h1 className="text-2xl font-bold text-foreground">KemaFinance</h1>
            <p className="text-sm text-muted-foreground">Sistema de Gestão Inteligente</p>
          </div>

          <div className="hidden lg:block space-y-2">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {showForgotPassword ? 'Recuperar senha' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-muted-foreground">
              {showForgotPassword
                ? 'Enviaremos um link para redefinir sua senha'
                : 'Acesse sua conta para continuar'}
            </p>
          </div>

          {showForgotPassword ? (
            <div className="space-y-5">
              {forgotSent ? (
                <div className="text-center space-y-4 bg-card border border-border rounded-2xl p-8">
                  <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Verifique seu email</h3>
                    <p className="text-sm text-muted-foreground">
                      Enviamos um link de recuperação para{' '}
                      <span className="text-foreground font-medium">{forgotEmail}</span>.
                      Clique no link para definir uma nova senha.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSent(false);
                    }}
                    className="w-full h-11 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        className="pl-10 h-11 bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20"
                  >
                    {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                  </button>
                </form>
              )}
            </div>
          ) : (
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/40 p-1 h-11 rounded-xl">
              <TabsTrigger
                value="signin"
                data-testid="tab-signin"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                data-testid="tab-signup"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>

            {/* SIGN IN */}
            <TabsContent value="signin" className="mt-6">
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  data-testid="login-google"
                  className="w-full h-11 rounded-xl border-border bg-card hover:bg-muted/50 font-medium"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
              <form
                id="login-form"
                name="login"
                aria-label="Login"
                autoComplete="on"
                data-testid="login-form"
                onSubmit={handleSignIn}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      autoComplete="email"
                      inputMode="email"
                      aria-label="Email"
                      data-testid="login-email"
                      className="pl-10 h-11 bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground text-sm font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="current-password"
                      aria-label="Senha"
                      data-testid="login-password"
                      className="pl-10 pr-10 h-11 bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      data-testid="login-toggle-password"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  id="login-submit"
                  data-testid="login-submit"
                  aria-label="Entrar"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar na conta'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    data-testid="login-forgot"
                    onClick={() => {
                      setForgotEmail(formData.email);
                      setForgotSent(false);
                      setShowForgotPassword(true);
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </form>
              </div>
            </TabsContent>

            {/* SIGN UP */}
            <TabsContent value="signup" className="mt-6">
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl border-border bg-card hover:bg-muted/50 font-medium"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground text-sm font-medium">Nome completo</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="pl-10 h-11 bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="pl-10 h-11 bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground text-sm font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="pl-10 pr-10 h-11 bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando conta...' : 'Criar minha conta'}
                </Button>
              </form>
              </div>
            </TabsContent>
          </Tabs>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Ao continuar, você concorda com nossos termos e política de privacidade.
          </p>
        </div>
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';


export const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
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
      console.error('Login error:', error);
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
          data: {
            full_name: formData.fullName
          }
        }
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
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-tech-particles"></div>
      <div className="absolute inset-0 bg-grid-pattern"></div>
      
      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-orange">KemaAI</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestão Inteligente</p>
        </div>

        <Card className="card-tech border-border/50">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Cadastrar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <LogIn className="w-5 h-5 text-primary" />
                  Fazer Login
                </CardTitle>
                <CardDescription>
                  Entre com suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required 
                      className="bg-input border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Senha</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Digite sua senha" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required 
                        className="bg-input border-border focus:border-primary focus:ring-primary/20"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Criar Conta
                </CardTitle>
                <CardDescription>
                  Crie uma nova conta para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">Nome Completo</Label>
                    <Input 
                      id="fullName" 
                      name="fullName" 
                      type="text" 
                      placeholder="Seu nome completo" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      required 
                      className="bg-input border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                    <Input 
                      id="signup-email" 
                      name="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required 
                      className="bg-input border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground">Senha</Label>
                    <div className="relative">
                      <Input 
                        id="signup-password" 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Crie uma senha segura" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required 
                        minLength={6} 
                        className="bg-input border-border focus:border-primary focus:ring-primary/20"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

import React from 'react';
import { DiagnosticoCard } from '@/components/DiagnosticoCard';
import { AlertasWidget } from '@/components/AlertasWidget';
import { AgenteChatPanel } from '@/components/AgenteChatPanel';
import { MetasProgressCard } from '@/components/MetasProgressCard';
import { PlanoDistribuicaoCard } from '@/components/PlanoDistribuicaoCard';
import { MetaReservaCard } from '@/components/MetaReservaCard';
import { GerarMetasButton } from '@/components/GerarMetasButton';
import { useKemaFinanceAI } from '@/hooks/useKemaFinanceAI';
import { useMetasFinanceiras, PlanoDistribuicao } from '@/hooks/useMetasFinanceiras';
import { Brain, Sparkles, Target, MessageCircle, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Agente() {
  const {
    diagnostico,
    alertas,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    suggestedQuestions,
  } = useKemaFinanceAI();

  const {
    metasAtivas,
    metaReserva,
    metaDistribuicao,
  } = useMetasFinanceiras();

  // Extract plano from metaDistribuicao metadata
  const planoDistribuicao: PlanoDistribuicao | null = metaDistribuicao?.metadata?.planoDistribuicao as PlanoDistribuicao | null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-particles"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-10 right-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        <div className="relative p-6 md:p-12 pb-8 md:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center glow-orange-sm">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gradient-orange flex items-center gap-2">
                  KemaFinance AI
                  <Sparkles className="w-6 h-6 text-primary" />
                </h1>
                <p className="text-muted-foreground">
                  Seu consultor financeiro pessoal inteligente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 -mt-4 md:-mt-8 relative z-10">
        <Tabs defaultValue="diagnostico" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="diagnostico" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Diagnóstico</span>
            </TabsTrigger>
            <TabsTrigger value="metas" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Metas</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Consultor</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Diagnóstico */}
          <TabsContent value="diagnostico" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <DiagnosticoCard diagnostico={diagnostico} />
                <AlertasWidget alertas={alertas} maxAlertas={4} />
              </div>
              <div className="lg:col-span-2">
                <AgenteChatPanel
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={sendMessage}
                  onClearMessages={clearMessages}
                  suggestedQuestions={suggestedQuestions}
                />
              </div>
            </div>

            {/* Financial Education Section */}
            <div className="card-tech p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Dicas de Educação Financeira
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-medium text-foreground mb-2">💡 Regra 50-30-20</h4>
                  <p className="text-sm text-muted-foreground">
                    Destine 50% para necessidades, 30% para desejos e 20% para poupança e dívidas.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-medium text-foreground mb-2">🎯 Reserva de Emergência</h4>
                  <p className="text-sm text-muted-foreground">
                    Tenha de 3 a 6 meses de despesas guardados antes de pensar em investimentos.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-medium text-foreground mb-2">📊 Método Avalanche</h4>
                  <p className="text-sm text-muted-foreground">
                    Pague primeiro as dívidas com juros mais altos para economizar mais a longo prazo.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Metas */}
          <TabsContent value="metas" className="space-y-6">
            {/* Generate Button */}
            <GerarMetasButton diagnostico={diagnostico} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution */}
              <PlanoDistribuicaoCard 
                plano={planoDistribuicao} 
                diagnostico={diagnostico} 
              />
              
              {/* Emergency Reserve */}
              <MetaReservaCard 
                diagnostico={diagnostico} 
                metaReserva={metaReserva} 
              />
            </div>

            {/* Goals Progress */}
            <MetasProgressCard metas={metasAtivas} />
          </TabsContent>

          {/* Tab: Chat */}
          <TabsContent value="chat">
            <AgenteChatPanel
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              onClearMessages={clearMessages}
              suggestedQuestions={suggestedQuestions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

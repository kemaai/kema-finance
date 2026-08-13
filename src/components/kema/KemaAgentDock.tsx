import React, { useEffect, useRef, useState } from 'react';
import { Brain, Send, Loader2, Trash2, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useKemaAgent } from '@/contexts/KemaAgentContext';
import { MarkdownLite } from './MarkdownLite';

export const KemaAgentDock: React.FC = () => {
  const {
    open,
    setOpen,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    suggestedQuestions,
    pageInsights,
    moduloLabel,
    diagnostico,
  } = useKemaAgent();

  const [value, setValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    sendMessage(value.trim());
    setValue('');
  };

  const urgentes = pageInsights.filter(i => i.severidade === 'critico').length;
  const scoreColor =
    diagnostico.scoreFinanceiro <= 39
      ? 'text-red-500'
      : diagnostico.scoreFinanceiro <= 69
      ? 'text-amber-500'
      : 'text-emerald-500';

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="kema-agent-trigger"
        aria-label="Abrir KEMA AI"
        className="fixed z-50 bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <Brain className="w-6 h-6" strokeWidth={2.2} />
        {urgentes > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {urgentes}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col gap-0"
          data-testid="kema-agent-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="icon-tile w-9 h-9 grad-violet">
                <Brain className="w-[18px] h-[18px]" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold text-foreground leading-tight">KEMA AI</h2>
                <p className="text-xs text-muted-foreground truncate">
                  {moduloLabel} · Score <span className={scoreColor}>{diagnostico.scoreFinanceiro}</span>/100
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" onClick={clearMessages} aria-label="Limpar conversa">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 px-4">
            {messages.length === 0 ? (
              <div className="py-6 space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground">
                    Como posso ajudar em {moduloLabel}?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Eu enxergo seus serviços, instalações, clientes, despesas e dívidas em tempo real.
                  </p>
                </div>

                {pageInsights.length > 0 && (
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      O que vejo nesta tela
                    </p>
                    {pageInsights.slice(0, 3).map(i => (
                      <p key={i.id} className="text-xs text-foreground">
                        • {i.titulo}
                      </p>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => !isLoading && sendMessage(q)}
                      className="w-full text-left text-xs rounded-xl border border-border px-3 py-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                {messages.map(m => (
                  <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : ''}>
                    {m.role === 'user' ? (
                      <p className="max-w-[85%] rounded-2xl bg-primary text-primary-foreground px-3 py-2 text-sm">
                        {m.content}
                      </p>
                    ) : m.content ? (
                      <MarkdownLite content={m.content} />
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analisando seus dados...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Composer */}
          <form onSubmit={submit} className="flex gap-2 p-3 border-t border-border">
            <Input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Pergunte ao KEMA..."
              disabled={isLoading}
              data-testid="kema-agent-input"
              className="flex-1 input-tech"
            />
            <Button
              type="submit"
              disabled={!value.trim() || isLoading}
              size="icon"
              className="rounded-full flex-shrink-0"
              data-testid="kema-agent-send"
              aria-label="Enviar pergunta"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};

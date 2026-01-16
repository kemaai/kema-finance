import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/hooks/useKemaFinanceAI';

interface AgenteChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearMessages: () => void;
  suggestedQuestions: string[];
}

export function AgenteChatPanel({
  messages,
  isLoading,
  onSendMessage,
  onClearMessages,
  suggestedQuestions,
}: AgenteChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    if (!isLoading) {
      onSendMessage(question);
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h4 key={i} className="font-bold text-foreground mt-3 mb-1">{line.slice(4)}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="font-bold text-lg text-foreground mt-4 mb-2">{line.slice(3)}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h2 key={i} className="font-bold text-xl text-foreground mt-4 mb-2">{line.slice(2)}</h2>;
        }
        // List items
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
        }
        if (line.match(/^\d+\. /)) {
          return <li key={i} className="ml-4 text-muted-foreground list-decimal">{line.replace(/^\d+\. /, '')}</li>;
        }
        // Bold text
        if (line.includes('**')) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={i} className="text-muted-foreground">
              {parts.map((part, j) => 
                j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
              )}
            </p>
          );
        }
        // Empty lines
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="text-muted-foreground">{line}</p>;
      });
  };

  return (
    <Card className="card-tech border-primary/30 flex flex-col h-[600px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            KemaFinance AI
          </CardTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearMessages}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          {messages.length === 0 ? (
            <div className="space-y-4 py-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Olá! Sou o KemaFinance AI
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Seu consultor financeiro pessoal. Posso analisar suas finanças, 
                  sugerir cortes de gastos, criar planos de economia e ajudar você 
                  a sair das dívidas.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Experimente perguntar:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading}
                      className="text-left h-auto py-2 px-3 justify-start text-xs hover:bg-primary/10 hover:border-primary/50"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 border border-border'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      <div className="text-sm space-y-1">
                        {message.content ? formatMessage(message.content) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analisando...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-4 flex-shrink-0">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite sua pergunta financeira..."
            disabled={isLoading}
            className="flex-1 input-tech"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="btn-tech px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

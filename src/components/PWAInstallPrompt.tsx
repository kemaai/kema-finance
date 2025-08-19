
import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se é iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Verificar se já está em modo standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone;
    setIsStandalone(standalone);

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar prompt se não estiver instalado
      if (!standalone) {
        setTimeout(() => setShowInstallPrompt(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA instalado com sucesso');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleClosePrompt = () => {
    setShowInstallPrompt(false);
    // Não mostrar novamente por 24 horas
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Não mostrar se já está instalado ou se foi dismissado recentemente
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  // Verificar se foi dismissado nas últimas 24 horas
  const lastDismissed = localStorage.getItem('pwa-install-dismissed');
  if (lastDismissed) {
    const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 1) {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl border-none">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              <h3 className="font-semibold text-lg">Instalar App</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClosePrompt}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm mb-4 text-white/90">
            {isIOS 
              ? 'Adicione à tela inicial para acesso rápido. Toque em "Compartilhar" e depois "Adicionar à Tela de Início".'
              : 'Instale nosso app para acesso rápido e experiência completa offline.'
            }
          </p>
          
          {!isIOS && deferredPrompt && (
            <Button
              onClick={handleInstallClick}
              className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar Agora
            </Button>
          )}
          
          {isIOS && (
            <div className="text-center">
              <p className="text-xs text-white/80">
                📱 Safari → Compartilhar → Adicionar à Tela de Início
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

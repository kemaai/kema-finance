import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Bypass for automation / headless / explicit opt-out
    try {
      const params = new URLSearchParams(window.location.search);
      const isAutomation =
        (navigator as any).webdriver === true ||
        /HeadlessChrome|Playwright|puppeteer/i.test(navigator.userAgent) ||
        params.has('automation') ||
        params.has('noPwa') ||
        localStorage.getItem('pwa-prompt-disabled') === '1';
      if (isAutomation) {
        if (params.has('automation') || params.has('noPwa')) {
          try { localStorage.setItem('pwa-prompt-disabled', '1'); } catch {}
        }
        setShowPrompt(false);
        return;
      }
    } catch {}

    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt after a delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    // Listen for the app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Show again after 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Check if user dismissed recently (within 24 hours)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const hoursAgo = (now - dismissedTime) / (1000 * 60 * 60);
      if (hoursAgo < 24) {
        setShowPrompt(false);
        return;
      }
    }
  }, []);

  // iOS Safari detection and manual instructions
  const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
                     /Safari/.test(navigator.userAgent) && 
                     !/Chrome/.test(navigator.userAgent);

  if (isInstalled || (!showPrompt && !isIOSSafari)) {
    return null;
  }

  if (isIOSSafari && !deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Card data-testid="pwa-install-card" className="shadow-lg border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Instalar App</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                data-testid="pwa-install-close"
                aria-label="Fechar"
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Adicione o Assistente Fácil à sua tela inicial
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-muted-foreground mb-3">
              Para instalar no iOS Safari:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Toque no ícone de compartilhar</li>
                <li>Role para baixo</li>
                <li>Toque em "Adicionar à Tela de Início"</li>
                <li>Toque em "Adicionar"</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card data-testid="pwa-install-card" className="shadow-lg border-2 border-primary/20 bg-gradient-to-r from-background to-background/95">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMobile ? <Smartphone className="h-5 w-5 text-primary" /> : <Monitor className="h-5 w-5 text-primary" />}
              <CardTitle className="text-lg">Instalar App</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              data-testid="pwa-install-close"
              aria-label="Fechar"
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Acesse mais rapidamente instalando o Assistente Fácil em seu {isMobile ? 'dispositivo' : 'computador'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button 
              onClick={handleInstallClick} 
              data-testid="pwa-install-accept"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!deferredPrompt}
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar Agora
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              data-testid="pwa-install-defer"
              className="px-3"
            >
              Depois
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Disable console logs in production to prevent sensitive data leakage
if (!import.meta.env.DEV) {
  const c = console as any;
  ['log', 'info', 'debug', 'warn', 'error'].forEach((m) => {
    c[m] = () => {};
  });
}

// Register Service Worker with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // Check for updates periodically (every 60 minutes)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Only reload if there's an active controller (avoids first-install reload)
          if (navigator.serviceWorker.controller) {
            window.location.reload();
          }
        });
      })
      .catch(() => {
        // SW registration failed silently
      });
  });
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

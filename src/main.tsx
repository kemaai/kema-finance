
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

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
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

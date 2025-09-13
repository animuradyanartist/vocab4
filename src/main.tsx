// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // safe even if App doesn't use it
import App from './App';
import './index.css';

// Register the PWA service worker injected by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

// Let TypeScript know about the boot helper defined in index.html
declare global {
  interface Window {
    __APP_BOOT_OK__?: () => void;
  }
}

// Register SW (auto updates). You can remove callbacks if you don't need them.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, _reg) {
    // console.log('SW registered:', _swUrl);
  },
  onNeedRefresh() {
    // console.log('New content available; will update on next load.');
  },
  onOfflineReady() {
    // console.log('App ready to work offline');
  },
});

const rootEl = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Hide the boot fallback defined in index.html once React is mounted
window.__APP_BOOT_OK__?.();

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // keep if you have Tailwind; safe even if the file already exists
// at the top with other imports
import { registerSW } from 'virtual:pwa-register'

// ... your existing ReactDOM createRoot(...)

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // keep if you have Tailwind; safe even if the file already exists

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('Renderer script starting...');
console.log('Root element:', document.getElementById('root'));
ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 
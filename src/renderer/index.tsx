import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('找不到 root 元素');
}

// 移除載入中的提示
const loadingElement = rootElement.querySelector('.loading');
if (loadingElement) {
  loadingElement.remove();
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
); 
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

registerSW({
  onOfflineReady() { },
  onNeedRefresh() { },
})

const queryClient = new QueryClient();
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
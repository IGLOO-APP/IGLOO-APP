import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
  root.render(
    <div style={{ 
      height: '100vh', 
      background: '#0b1011', 
      color: 'white', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
      <h1 style={{ color: '#13c8ec' }}>Configuração Pendente</h1>
      <p style={{ maxWidth: '400px', lineHeight: '1.6', color: '#94a3b8' }}>
        O iGloo não conseguiu encontrar a chave de acesso (Clerk).
        Isso acontece quando o Vercel ainda não terminou o processamento das variáveis de ambiente.
      </p>
      <div style={{ background: '#141b1d', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '20px' }}>
        <p style={{ fontSize: '13px', margin: 0 }}>Ação necessária: <strong>Faça um Redeploy no Vercel</strong>.</p>
      </div>
    </div>
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
// import { dark } from '@clerk/themes'; // Removed temporarily - run npm install to use
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key. Set VITE_CLERK_PUBLISHABLE_KEY in your .env file.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          // baseTheme: dark,
          variables: {
            colorPrimary: '#8b5cf6', // Violet 500
            colorBackground: '#0f172a', // Slate 900
            colorText: '#f8fafc',
            colorTextSecondary: '#94a3b8',
            colorInputBackground: '#1e293b',
            colorInputText: '#f8fafc',
            borderRadius: '16px',
            fontFamily: "'Outfit', sans-serif",
          },
          elements: {
            card: 'glass-card border-white/10 shadow-2xl',
            navbar: 'hidden',
            footer: 'hidden',
            formButtonPrimary: 'btn-primary border-none normal-case tracking-wide py-3',
            socialButtonsBlockButton: 'bg-white/5 border-white/10 hover:bg-white/10 transition-all text-white',
            formFieldInput: 'bg-slate-800/50 border-white/10 rounded-xl focus:border-purple-500/50 transition-all',
            dividerLine: 'bg-white/10',
            dividerText: 'text-slate-500',
            identityPreviewText: 'text-white',
            identityPreviewEditButtonIcon: 'text-purple-400',
          }
        }}
      >
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);

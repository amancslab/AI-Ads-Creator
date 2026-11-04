import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { validateFirestoreConnection } from './lib/firebase.ts';

// Global Google Maps Platform Demo Key quota listener (Section 8 Case A)
(window as any).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};
const origError = console.error;
console.error = (...args: unknown[]) => {
  origError.apply(console, args);
  const msg = args.map((a) => String(a)).join(' ');
  if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

validateFirestoreConnection();

createRoot(document.getElementById('root')!).render(<App />);

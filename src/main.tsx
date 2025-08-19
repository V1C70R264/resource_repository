import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure a hash-based route is present when served under DHIS2 app paths
if (!window.location.hash) {
  const base = window.location.pathname + window.location.search + '#/';
  window.location.replace(base);
}

// Ensure the browser title reflects the app name inside DHIS2
document.title = 'DHIS 2 - Resource Repository';

createRoot(document.getElementById("root")!).render(<App />);

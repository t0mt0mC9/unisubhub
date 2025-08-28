import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeOneSignal } from './lib/onesignal'
import './lib/test-onesignal'

// Initialize OneSignal
initializeOneSignal();

createRoot(document.getElementById("root")!).render(<App />);

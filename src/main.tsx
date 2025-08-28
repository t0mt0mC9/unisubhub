import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeOneSignal } from './lib/onesignal'
import './lib/test-onesignal'
import './lib/send-test-notification'
import './lib/test-notification-direct'

// Initialize OneSignal
initializeOneSignal();

createRoot(document.getElementById("root")!).render(<App />);

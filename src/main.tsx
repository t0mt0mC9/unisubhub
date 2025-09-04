import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// OneSignal initialization moved to app startup to prevent crashes

createRoot(document.getElementById("root")!).render(<App />);

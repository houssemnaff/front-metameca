import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
console.log("VITE SERVICE:", import.meta.env.VITE_EMAILJS_SERVICE_ID);
console.log("FULL ENV:", import.meta.env);
createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    <App />
  </StrictMode>,
)

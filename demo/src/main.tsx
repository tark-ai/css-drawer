import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { enableAccessibility } from 'css-drawer'
import App from './App'
import './index.css'

// Enable inert attribute management for stacked drawers
enableAccessibility()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

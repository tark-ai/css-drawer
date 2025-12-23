import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { enableAccessibility } from 'css-drawer'
import App from './App'
import AppMinimal from './AppMinimal'
import './index.css'

// Enable inert attribute management for stacked drawers
enableAccessibility()

// Use ?minimal in URL to test the minimal API
const useMinimal = window.location.search.includes('minimal')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {useMinimal ? <AppMinimal /> : <App />}
  </StrictMode>,
)

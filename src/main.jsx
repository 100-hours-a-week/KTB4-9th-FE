import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initClarity } from './services/clarity.js'
import { initializeTheme } from './features/theme/theme.js'

initializeTheme()
initClarity()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

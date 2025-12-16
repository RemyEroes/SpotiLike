import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LoggedProvider } from './context/LoggedContext.tsx'
import './style/index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoggedProvider>
      <App />
    </LoggedProvider>
  </StrictMode>,
)

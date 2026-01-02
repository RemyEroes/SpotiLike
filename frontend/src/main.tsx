// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LoggedProvider } from './context/LoggedContext.tsx'
import { PlayerProvider } from './context/PlayerContext.tsx'
import './style/index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <BrowserRouter>
      <LoggedProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </LoggedProvider>
    </BrowserRouter>
  // </StrictMode>,
)

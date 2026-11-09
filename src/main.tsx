import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { FournisseurApp } from './contexte'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <FournisseurApp>
        <App />
      </FournisseurApp>
    </HashRouter>
  </StrictMode>,
)

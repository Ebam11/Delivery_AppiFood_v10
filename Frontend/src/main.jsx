//estilos globales primero
//configuraciones de la app, iran antes de componentes = i18n.js
//componentes raiz al final
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Aplicar preferencias guardadas
if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode')
const fs = localStorage.getItem('fontSize')
if (fs === 'Pequeño') document.body.classList.add('font-small')
if (fs === 'Grande') document.body.classList.add('font-large')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

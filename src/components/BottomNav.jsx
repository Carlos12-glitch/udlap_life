import { useNavigate, useLocation } from 'react-router-dom'
import './BottomNav.css'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const isActive = (routes) => routes.some(r => path.startsWith(r))

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${isActive(['/home', '/profile', '/avisos', '/eventos', '/settings']) ? 'active' : ''}`}
        onClick={() => navigate('/home')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        <span>Inicio</span>
      </button>
      <button
        className={`nav-item ${isActive(['/escolar', '/horario', '/calificaciones', '/transcript']) ? 'active' : ''}`}
        onClick={() => navigate('/escolar')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <span>Escolar</span>
      </button>
      <button
        className={`nav-item ${isActive(['/pagos']) ? 'active' : ''}`}
        onClick={() => navigate('/pagos')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        <span>Pagos</span>
      </button>
      <button
        className={`nav-item ${isActive(['/comunidad', '/transporte', '/alimentos', '/mapa']) ? 'active' : ''}`}
        onClick={() => navigate('/comunidad')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
        <span>Comunidad</span>
      </button>
    </nav>
  )
}

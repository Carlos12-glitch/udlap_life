import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import logo from '../assets/udlaplife.png'
import campus from '../assets/udlap.jpg'
import './Login.css'

export default function Login() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!id || !password) {
      setError('Por favor ingresa tu ID y Contraseña')
      return
    }
    setError('')
    setLoading(true)
    try {
      // Firebase Auth requiere email completo; los usuarios solo ingresan su ID numérico.
      await signInWithEmailAndPassword(auth, `${id}@udlap.mx`, password)
      navigate('/biometric')
    } catch (e) {
      if (e.code === 'auth/invalid-credential') {
        setError('ID o contraseña incorrectos')
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-bg" style={{backgroundImage: `url(${campus})`}} />
      <div className="login-header">
        <img src={logo} alt="UDLAPLife" className="login-logo-img" />
        <h1 className="login-title">UDLAPLife</h1>
      </div>

      <div className="login-card">
        <h2>Iniciar Sesión</h2>

        <div className="form-group">
          <label>ID</label>
          <input
            type="text"
            placeholder="Ingresa tu ID"
            value={id}
            onChange={e => { setId(e.target.value); setError('') }}
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
            />
            <button className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <button className="forgot-btn" onClick={() => navigate('/reset-password')}>¿Olvidaste tu contraseña?</button>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Verificando...' : 'Continuar'}
        </button>

        <hr className="divider" />

        <p className="support-text">
          ¿Necesitas ayuda? <span className="link" onClick={() => window.open('https://servicedeskweb.udlap.mx/', '_blank')}>Contactar Soporte</span>
        </p>
      </div>

      <p className="footer-text">© 2026 Universidad. Todos los derechos reservados.</p>
    </div>
  )
}

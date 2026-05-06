import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import logo from '../assets/udlaplife.png'
import campus from '../assets/udlap.jpg'
import './Login.css'

export default function ResetPassword() {
  const [id, setId] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleReset = async () => {
    if (!id.trim()) {
      setError('Por favor ingresa tu ID')
      return
    }
    setError('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, `${id.trim()}@udlap.mx`)
      setEnviado(true)
    } catch (e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-email') {
        setError('No existe una cuenta con ese ID')
      } else {
        setError('Error al enviar el correo. Intenta de nuevo.')
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
        {enviado ? (
          <>
            <div style={{textAlign:'center', marginBottom:20}}>
              <div style={{fontSize:48, marginBottom:12}}>📧</div>
              <h2 style={{fontSize:20, fontWeight:700, color:'#1f2937', marginBottom:8}}>Correo enviado</h2>
              <p style={{fontSize:14, color:'#6b7280', lineHeight:1.6}}>
                Revisa la bandeja de entrada de <strong>{id}@udlap.mx</strong> y sigue las instrucciones para restablecer tu contraseña.
              </p>
            </div>
            <button className="submit-btn" onClick={() => navigate('/login')}>
              Volver al inicio de sesión
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              style={{background:'none', border:'none', cursor:'pointer', padding:0, marginBottom:16, display:'flex', alignItems:'center', gap:6, color:'#6b7280', fontSize:13}}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Volver
            </button>

            <h2>Recuperar contraseña</h2>
            <p style={{fontSize:14, color:'#6b7280', marginBottom:20, marginTop:-12}}>
              Ingresa tu ID y te enviaremos un correo para restablecer tu contraseña.
            </p>

            <div className="form-group">
              <label>ID UDLAP</label>
              <input
                type="text"
                placeholder="Ej. 184020"
                value={id}
                onChange={e => { setId(e.target.value); setError('') }}
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button className="submit-btn" onClick={handleReset} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar correo de recuperación'}
            </button>
          </>
        )}
      </div>

      <p className="footer-text">© 2026 Universidad. Todos los derechos reservados.</p>
    </div>
  )
}

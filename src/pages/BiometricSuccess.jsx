import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import campus from '../assets/udlap.jpg'
import './Biometric.css'

export default function BiometricSuccess() {
  const navigate = useNavigate()

  // Redirige a Home tras mostrar el checkmark 1.8 s — diferente a 2 s de Scanning
  // para que la transición se sienta más fluida al encadenarse.
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home')
    }, 1800)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="biometric-screen">
      <div className="bio-bg" style={{backgroundImage: `url(${campus})`}} />
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h2 className="biometric-title">¡Verificado!</h2>
      <p className="biometric-subtitle">Autenticación exitosa</p>
    </div>
  )
}

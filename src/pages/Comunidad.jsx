import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import FavoritoBtn from '../components/FavoritoBtn'
import BottomNav from '../components/BottomNav'
import './Comunidad.css'

export default function Comunidad() {
  const navigate = useNavigate()
  const [publicaciones, setPublicaciones] = useState([])
  const [texto, setTexto] = useState('')
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    const user = auth.currentUser
    if (user) setNombre(user.email.split('@')[0])

    const q = query(collection(db, 'publicaciones'), orderBy('fecha', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setPublicaciones(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [])

  async function publicar() {
    if (!texto.trim()) return
    await addDoc(collection(db, 'publicaciones'), {
      autor: nombre,
      contenido: texto.trim(),
      fecha: serverTimestamp(),
    })
    setTexto('')
  }

  return (
    <div className="comunidad-screen">
      <div className="comunidad-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1>Comunidad</h1>
          <FavoritoBtn ruta="/comunidad" />
        </div>
      </div>

      <div className="comunidad-content">
        <div className="comunidad-item" onClick={() => navigate('/alimentos')}>
          <div className="com-icon orange" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2v6a3 3 0 006 0V2"/>
              <line x1="9" y1="8" x2="9" y2="22"/>
              <line x1="18" y1="2" x2="18" y2="22"/>
              <path d="M15 2v5c0 1.7 1.3 3 3 3s3-1.3 3-3V2"/>
            </svg>
          </div>
          <div className="com-info">
            <div className="com-title">Menú del día</div>
            <div className="com-desc">Menús y horarios de cafeterías</div>
          </div>
          <span className="arrow">›</span>
        </div>

        <div className="comunidad-item" onClick={() => navigate('/transporte')}>
          <div className="com-icon teal" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="6" width="22" height="12" rx="3"/>
              <path d="M16 6V4a1 1 0 00-1-1H9a1 1 0 00-1 1v2"/>
              <circle cx="7" cy="18" r="1.5" fill="#0d9488"/>
              <circle cx="17" cy="18" r="1.5" fill="#0d9488"/>
              <line x1="7" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <div className="com-info">
            <div className="com-title">Transporte</div>
            <div className="com-desc">Rutas y horarios de autobuses</div>
          </div>
          <span className="arrow">›</span>
        </div>

        <div className="comunidad-item" onClick={() => navigate('/mapa')}>
          <div className="com-icon blue" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="com-info">
            <div className="com-title">Mapa</div>
            <div className="com-desc">Explora el campus universitario</div>
          </div>
          <span className="arrow">›</span>
        </div>

      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

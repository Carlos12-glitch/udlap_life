import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { saveCache, loadCache } from '../utils/cache'
import BottomNav from '../components/BottomNav'
import './Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(() => loadCache('usuario'))

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) {
        const id = user.email.split('@')[0]
        getDoc(doc(db, 'usuarios', id)).then(snap => {
          if (snap.exists()) {
            const raw = snap.data()
            const data = {
              nombre: raw.nombre?.trim(),
              id: raw.id,
              promedio: raw.Promedio ?? raw.promedio,
              creditos: raw.creditos,
              semestre: raw.semestre,
              carrera: raw.Carrera ?? raw.carrera,
              periodoIngreso: raw['Periodo de ingreso']?.trim() ?? raw.periodoIngreso,
              correo: raw.correo?.trim(),
              telefono: raw.telefono?.trim(),
              direccion: raw['Dirección']?.trim() ?? raw['Dirección ']?.trim() ?? raw.direccion,
              fechaNacimiento: raw['Fecha de nacimiento']?.trim() ?? raw.fechaNacimiento,
              estado: raw.estado,
              programa: raw.programa,
            }
            setUsuario(data)
            saveCache('usuario', data)
          }
        })
      }
    })
    return () => unsub()
  }, [])

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '...'

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <button className="settings-btn" onClick={() => navigate('/settings')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
        <h1 className="profile-title">Mi perfil</h1>
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{iniciales}</div>
        </div>
        <h2 className="profile-name">{usuario?.nombre || 'Cargando...'}</h2>
        <p className="profile-id">ID: {usuario?.id || ''}</p>
        <div className="profile-stats">
          <div className="stat"><span className="stat-val blue">{usuario?.promedio || '-'}</span><span className="stat-label">Promedio</span></div>
          <div className="stat"><span className="stat-val green">{usuario?.creditos || '-'}</span><span className="stat-label">Créditos</span></div>
          <div className="stat"><span className="stat-val purple">{usuario?.semestre || '-'}</span><span className="stat-label">Semestre</span></div>
        </div>
      </div>

      <div className="profile-content">
        <div className="info-section">
          <h3>Información académica</h3>
          <div className="info-card">
            <div className="info-row"><span className="info-label">Carrera</span><span className="info-val">{usuario?.carrera || '-'}</span></div>
            <div className="info-row"><span className="info-label">Promedio</span><span className="info-val">{usuario?.promedio || '-'}</span></div>
            <div className="info-row"><span className="info-label">Periodo de ingreso</span><span className="info-val">{usuario?.periodoIngreso || '-'}</span></div>
          </div>
        </div>

        <div className="info-section">
          <h3>Información de contacto</h3>
          <div className="info-card">
            <div className="contact-row">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div><div className="contact-label">Correo</div><div className="contact-val">{usuario?.correo || '-'}</div></div>
            </div>
            <div className="contact-row">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14z"/></svg>
              </div>
              <div><div className="contact-label">Teléfono</div><div className="contact-val">{usuario?.telefono || '-'}</div></div>
            </div>
            <div className="contact-row">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" width="18" height="18"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div><div className="contact-label">Dirección</div><div className="contact-val">{usuario?.direccion || '-'}</div></div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Información personal</h3>
          <div className="info-card">
            <div className="info-row"><span className="info-label">Fecha de nacimiento</span><span className="info-val">{usuario?.fechaNacimiento || '-'}</span></div>
            <div className="info-row"><span className="info-label">Estado del estudiante</span><span className="info-val green-text">{usuario?.estado || '-'}</span></div>
            <div className="info-row"><span className="info-label">Tipo de programa</span><span className="info-val bold">{usuario?.programa || '-'}</span></div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <span>↩</span> Cerrar sesión
        </button>
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

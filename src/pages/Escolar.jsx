import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { saveCache, loadCache } from '../utils/cache'
import FavoritoBtn from '../components/FavoritoBtn'
import BottomNav from '../components/BottomNav'
import './Escolar.css'

// Fallback para alumnos de una sola carrera sin progresoCarreras en Firestore.
// Los alumnos de doble carrera usan el arreglo progresoCarreras con sus propios totales.
const CREDITOS_TOTALES = 246

export default function Escolar() {
  const navigate = useNavigate()
  const [creditos, setCreditos] = useState(() => loadCache('usuario')?.creditos ?? null)
  const [progresoCarreras, setProgresoCarreras] = useState(() => loadCache('usuario')?.progresoCarreras ?? null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) {
        const id = user.email.split('@')[0]
        getDoc(doc(db, 'usuarios', id)).then(snap => {
          if (snap.exists()) {
            const data = snap.data()
            const val = data.creditos ?? null
            const prog = data.progresoCarreras ?? null
            setCreditos(val)
            setProgresoCarreras(prog)
            const cached = loadCache('usuario') || {}
            saveCache('usuario', { ...cached, creditos: val, progresoCarreras: prog })
          }
        })
      }
    })
    return () => unsub()
  }, [])

  const pct = creditos != null ? Math.round((creditos / CREDITOS_TOTALES) * 100) : null
  const restantes = creditos != null ? CREDITOS_TOTALES - creditos : null

  return (
    <div className="escolar-screen">
      <div className="escolar-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1>Escolar</h1>
          <FavoritoBtn ruta="/escolar" />
        </div>
      </div>

      <div className="escolar-content">
        <h3 className="section-title">Centro académico</h3>

        <div className="academic-card" onClick={() => navigate('/horario')}>
          <div className="ac-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div className="ac-info">
            <div className="ac-name">Horario</div>
            <div className="ac-desc">Ver tu horario de clases semanal</div>
          </div>
          <div className="ac-action">Ver Horario</div>
        </div>

        <div className="academic-card" onClick={() => navigate('/calificaciones')}>
          <div className="ac-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>
          <div className="ac-info">
            <div className="ac-name">Calificaciones</div>
            <div className="ac-desc">Revisa tus calificaciones y rendimiento</div>
          </div>
          <div className="ac-action">Promedio 9.5</div>
        </div>

        <div className="academic-card" onClick={() => navigate('/transcript')}>
          <div className="ac-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
          <div className="ac-info">
            <div className="ac-name">Transcript</div>
            <div className="ac-desc">Ver tu transcript completo</div>
          </div>
          <div className="ac-action">124 Créditos</div>
        </div>

        <h3 className="section-title">Tutor académico</h3>
        <div className="tutor-card">
          <div className="tutor-icon">
            <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,#4db6ac,#26a69a)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <polyline points="16 11 17.5 13 21 10"/>
              </svg>
            </div>
          </div>
          <div>
            <div className="tutor-name">Dr. Carlos Mendoza Ramírez</div>
            <div className="tutor-contact" style={{display:'flex',alignItems:'center',gap:6}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" width="14" height="14"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14z"/></svg>
              Ext. 4521
            </div>
            <div className="tutor-contact" style={{display:'flex',alignItems:'center',gap:6}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              carlos.mendoza@universidad.edu
            </div>
          </div>
        </div>

        <h3 className="section-title">Progreso de carrera</h3>
        {progresoCarreras ? (
          progresoCarreras.map((c, i) => {
            const p = Math.round((c.creditos / c.total) * 100)
            const r = c.total - c.creditos
            const colores = ['#f97316', '#3b82f6']
            return (
              <div className="progress-card" key={i} style={{marginBottom: 12}}>
                <div style={{fontSize: 12, fontWeight: 600, color: colores[i % 2], marginBottom: 6}}>{c.nombre}</div>
                <div className="progress-header">
                  <div><div className="prog-label">Créditos</div><div className="prog-val" style={{color: colores[i % 2]}}>{c.creditos} / {c.total}</div></div>
                  <div><div className="prog-label">Completado</div><div className="prog-pct" style={{color: colores[i % 2]}}>{p}%</div></div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${p}%`, background: colores[i % 2]}} />
                </div>
                <p className="prog-remaining">{r} créditos restantes</p>
              </div>
            )
          })
        ) : (
          <div className="progress-card">
            <div className="progress-header">
              <div><div className="prog-label">Créditos</div><div className="prog-val">{creditos ?? '...'} / {CREDITOS_TOTALES}</div></div>
              <div><div className="prog-label">Completado</div><div className="prog-pct">{pct ?? '...'}%</div></div>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width: `${pct ?? 0}%`}} /></div>
            <p className="prog-remaining">{restantes ?? '...'} créditos restantes para graduarse</p>
          </div>
        )}

        <div className="apoyo-card">
          <div className="apoyo-title">Orientación académica</div>
          <div className="apoyo-contacto-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <span>Oficina de Orientación Académica: BI-405</span>
          </div>
          <div className="apoyo-contacto-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14z"/></svg>
            <span>2292000 ext: 2219, 4421, 2344 y 2355</span>
          </div>
          <div className="apoyo-contacto-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>orientacion.academica@udlap.mx</span>
          </div>
          <div className="apoyo-contacto-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Horario de atención: 9:00 a 18:00 h</span>
          </div>
        </div>
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

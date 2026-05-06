import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { saveCache, loadCache } from '../utils/cache'
import FavoritoBtn from '../components/FavoritoBtn'
import BottomNav from '../components/BottomNav'
import './Calificaciones.css'

// Más reciente primero — el alumno normalmente quiere ver el periodo actual al abrir.
const ORDEN_PERIODOS = ['Primavera 2026', 'Otoño 2025', 'Primavera 2025']

export default function Calificaciones() {
  const navigate = useNavigate()
  const [periodo, setPeriodo] = useState(0)
  const [expanded, setExpanded] = useState(null)
  const [periodos, setPeriodos] = useState(() => loadCache('calificaciones') || [])
  const [loading, setLoading] = useState(!loadCache('calificaciones'))

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) return
      const id = user.email.split('@')[0]
      getDocs(collection(db, 'usuarios', id, 'calificaciones')).then(snap => {
      const grupos = {}
      snap.docs.forEach(doc => {
        const raw = doc.data()
        const clean = {}
        Object.entries(raw).forEach(([k, v]) => {
          clean[k.trim()] = typeof v === 'string' ? v.trim() : v
        })
        const label = clean.periodo
        if (!grupos[label]) grupos[label] = []
        if (typeof clean.cal !== 'number') clean.cal = null
        grupos[label].push(clean)
      })

      const lista = ORDEN_PERIODOS.filter(l => grupos[l]).map(label => {
        const materias = grupos[label]
        const calificadas = materias.filter(m => m.cal != null)
        const promedio = calificadas.length
          ? (calificadas.reduce((s, m) => s + m.cal, 0) / calificadas.length).toFixed(1)
          : 'N/A'
        return { label, promedio, materias }
      })

      setPeriodos(lista)
      saveCache('calificaciones', lista)
      setLoading(false)
      })
    })
    return () => unsub()
  }, [])

  if (loading) return <div style={{textAlign:'center', padding:64, color:'#6b7280'}}>Cargando calificaciones...</div>

  const p = periodos[periodo] || { label: '', promedio: '-', materias: [] }
  const creditosPeriodo = p.materias.reduce((s, m) => s + (m.creditos || 0), 0)
  const todasCalificadas = periodos.flatMap(pd => pd.materias).filter(m => m.cal != null)
  const promedioGeneral = todasCalificadas.length
    ? (todasCalificadas.reduce((s, m) => s + m.cal, 0) / todasCalificadas.length).toFixed(1)
    : '-'

  return (
    <div className="calif-screen">
      <div className="calif-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <button className="header-back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <FavoritoBtn ruta="/calificaciones" />
        </div>
        <h1>Calificaciones</h1>
      </div>

      <div className="periodos-tabs">
        {periodos.map((pd, i) => (
          <button
            key={i}
            className={`periodo-tab ${periodo === i ? 'active' : ''}`}
            onClick={() => setPeriodo(i)}
          >
            <div className="pt-label">{pd.label}</div>
            <div className="pt-prom">Promedio: {pd.promedio}</div>
          </button>
        ))}
      </div>

      <div className="calif-content">
        <h3>Calificaciones por materia</h3>
        {p.materias.map((m, i) => (
          <div key={i} className="materia-card" onClick={() => setExpanded(expanded === i ? null : i)}>
            <div className="materia-row">
              <div>
                <div className="materia-clave">{m.clave} <span className="materia-cred">• {m.creditos} Creditos</span></div>
                <div className="materia-nombre">{m.nombre}</div>
              </div>
              <div className="materia-right">
                {m.cal != null
                  ? <span className="materia-cal">{m.cal}</span>
                  : <span className="materia-pendiente">Pendiente</span>
                }
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{width:16, height:16, transform: expanded===i?'rotate(180deg)':'', transition:'0.2s'}}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            {expanded === i && (
              <div className="materia-detail">
                <div className="detail-row"><span>Calificación final</span><span className="detail-val">{m.cal ?? '—'}</span></div>
                <div className="detail-row"><span>Créditos</span><span className="detail-val">{m.creditos}</span></div>
                <div className="detail-row"><span>Estado</span>
                  <span className={`detail-val ${m.cal == null ? 'orange' : m.cal <= 7.5 ? 'red' : 'green'}`}>
                    {m.cal == null ? 'Pendiente' : m.cal <= 7.5 ? 'Reprobada' : 'Aprobado'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

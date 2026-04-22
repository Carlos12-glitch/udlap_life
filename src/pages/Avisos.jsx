import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { saveCache, loadCache } from '../utils/cache'
import BottomNav from '../components/BottomNav'
import './Avisos.css'

const filtros = ['Todos', 'Urgente', 'Académico', 'Eventos']

export default function Avisos() {
  const [filtro, setFiltro] = useState('Todos')
  const [avisos, setAvisos] = useState(() => loadCache('avisos') || [])
  const [loading, setLoading] = useState(!loadCache('avisos'))

  useEffect(() => {
    getDocs(collection(db, 'avisos')).then(snap => {
      const data = snap.docs.map(doc => {
        const raw = doc.data()
        const clean = {}
        Object.entries(raw).forEach(([k, v]) => {
          clean[k.trim()] = typeof v === 'string' ? v.trim() : v
        })
        return { id: doc.id, ...clean }
      })
      setAvisos(data)
      saveCache('avisos', data)
      setLoading(false)
    })
  }, [])

  const filtered = avisos.filter(a =>
    filtro === 'Todos' ||
    a.tipo.toLowerCase() === filtro.toLowerCase()
  )

  const fijados = filtered.filter(a => a.fijado)
  const recientes = filtered.filter(a => !a.fijado)

  return (
    <div className="avisos-screen">
      <div className="avisos-header">
        <div className="avisos-header-top">
          <h1>Avisos</h1>
          <span className="badge-new">3 Nuevos</span>
        </div>
        <p className="avisos-subtitle">Mantente al día con las noticias del campus</p>
        <div className="filtros">
          {filtros.map(f => (
            <button
              key={f}
              className={`filtro-btn ${filtro === f ? 'active' : ''}`}
              onClick={() => setFiltro(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="avisos-content">
        {loading && <div style={{textAlign:'center', padding:32, color:'#6b7280'}}>Cargando avisos...</div>}
        {!loading && filtered.length === 0 && <div style={{textAlign:'center', padding:32, color:'#6b7280'}}>No hay avisos</div>}
        {fijados.length > 0 && (
          <>
            <div className="section-label">📌 FIJADOS</div>
            {fijados.map(a => <AvisoCard key={a.id} aviso={a} />)}
          </>
        )}
        {recientes.length > 0 && (
          <>
            <div className="section-label">RECIENTES</div>
            {recientes.map(a => <AvisoCard key={a.id} aviso={a} />)}
          </>
        )}
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

function AvisoCard({ aviso }) {
  return (
    <div className="aviso-card">
      <div className="aviso-card-header">
        <div className="aviso-tipo">
          <span className="tipo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" width="14" height="14"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </span>
          <span className="tipo-label">{aviso.tipo.toUpperCase()}</span>
        </div>
        <div className="aviso-actions">
          {aviso.fijado && <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="14" height="14"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17H19V13L17 7V3H7V7L5 13V17Z"/></svg>}
          {aviso.nuevo && <span className="dot" />}
        </div>
      </div>
      <div className="aviso-titulo">{aviso.titulo}</div>
      <div className="aviso-desc">{aviso.desc}</div>
      <div className="aviso-fecha">{aviso.fecha}</div>
    </div>
  )
}

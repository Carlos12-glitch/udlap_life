// Lee de la colección global 'eventos' (no es por usuario).
// Soporta dos vistas: por categoría (filtro badge) y por fecha (date input).
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { saveCache, loadCache } from '../utils/cache'
import BottomNav from '../components/BottomNav'
import './Eventos.css'

const categorias = ['Todos', 'Académicos', 'Deportes', 'Cultural']

export default function Eventos() {
  const [vista, setVista] = useState('categoria')
  const [cat, setCat] = useState('Todos')
  const [fecha, setFecha] = useState('2026-03-02')
  const [eventos, setEventos] = useState(() => loadCache('eventos') || [])
  const [loading, setLoading] = useState(!loadCache('eventos'))

  useEffect(() => {
    getDocs(collection(db, 'eventos')).then(snap => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEventos(data)
      saveCache('eventos', data)
      setLoading(false)
    })
  }, [])

  const filtered = eventos.filter(e =>
    cat === 'Todos' || e.categoria.toLowerCase().includes(cat.slice(0, -1).toLowerCase())
  )

  const filteredFecha = eventos.filter(e => e.fechaISO === fecha)

  return (
    <div className="eventos-screen">
      <div className="eventos-header">
        <h1>Eventos</h1>
        <p className="eventos-subtitle">Descubre y participa en actividades</p>
        <div className="vista-btns">
          <button className={`vista-btn ${vista === 'categoria' ? 'active' : ''}`} onClick={() => setVista('categoria')} style={{display:'flex',alignItems:'center',gap:5}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" strokeWidth="3"/><line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round" strokeWidth="3"/><line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round" strokeWidth="3"/></svg>
            Por categoría
          </button>
          <button className={`vista-btn ${vista === 'fecha' ? 'active' : ''}`} onClick={() => setVista('fecha')} style={{display:'flex',alignItems:'center',gap:5}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Por fecha
          </button>
        </div>
        {vista === 'categoria' && (
          <div className="filtros">
            {categorias.map(c => (
              <button key={c} className={`filtro-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        )}
        {vista === 'fecha' && (
          <div className="fecha-select">
            <label>Selecciona una fecha</label>
            <div className="fecha-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="eventos-content">
        {loading ? (
          <div className="empty-state"><p>Cargando eventos...</p></div>
        ) : vista === 'fecha' ? (
          filteredFecha.length > 0
            ? filteredFecha.map(e => <EventoCard key={e.id} evento={e} />)
            : <div className="empty-state"><div className="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" width="48" height="48"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><p>No hay eventos para esta fecha</p><span>Intenta seleccionar otra fecha</span></div>
        ) : filtered.length > 0
            ? filtered.map(e => <EventoCard key={e.id} evento={e} />)
            : <div className="empty-state"><div className="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" width="48" height="48"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><p>No hay eventos disponibles</p></div>
        }
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

const CAT_FALLBACK = {
  académico:  { bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', emoji: '🎓' },
  deporte:    { bg: 'linear-gradient(135deg,#ef4444,#f97316)', emoji: '⚽' },
  cultural:   { bg: 'linear-gradient(135deg,#a855f7,#7c3aed)', emoji: '🎭' },
  default:    { bg: 'linear-gradient(135deg,#6b7280,#374151)', emoji: '📅' },
}

function EventoCard({ evento }) {
  const key = Object.keys(CAT_FALLBACK).find(k => evento.categoria?.toLowerCase().includes(k)) ?? 'default'
  const fallback = CAT_FALLBACK[key]

  return (
    <div className="evento-card">
      <div className="evento-img">
        {evento.imagen
          ? <img src={evento.imagen} alt={evento.titulo} style={{width:'100%',height:'100%',objectFit:'cover'}} />
          : <div style={{width:'100%',height:'100%',background:fallback.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:48}}>
              {fallback.emoji}
            </div>
        }
      </div>
      <div className="evento-body">
        <div className="evento-titulo">{evento.titulo}</div>
        <div className="evento-cat">{evento.categoria}</div>
        <div className="evento-detail" style={{display:'flex',alignItems:'center',gap:5}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {evento.fecha}
        </div>
        <div className="evento-detail" style={{display:'flex',alignItems:'center',gap:5}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {evento.hora}
        </div>
        <div className="evento-detail" style={{display:'flex',alignItems:'center',gap:5}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="13" height="13"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {evento.lugar}
        </div>
        <div className="evento-detail" style={{display:'flex',alignItems:'center',gap:5}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="13" height="13"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          {evento.registrados} registrados
        </div>
      </div>
    </div>
  )
}

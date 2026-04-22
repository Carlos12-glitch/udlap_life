import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { saveCache, loadCache } from '../utils/cache'
import FavoritoBtn from '../components/FavoritoBtn'
import BottomNav from '../components/BottomNav'
import './Alimentos.css'

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const TIPOS_MENU = [
  {
    nombre: 'Menú de línea',
    precio: '$125.00',
    items: [
      'Sopa del día',
      'Plato fuerte elegir de 2 opciones y 2 guarniciones',
      '2 vasos de agua',
      '2 panes de sal o un paquete de tortillas',
      'Postre',
    ],
  },
  {
    nombre: 'Menú estudiantil',
    precio: '$103.00',
    items: [
      'Sopa del día o Postre',
      'Plato fuerte con dos guarniciones',
      '2 vasos de agua',
      '2 panes de sal o un paquete de tortillas',
    ],
  },
]

export default function Alimentos() {
  const navigate = useNavigate()
  const [dia, setDia] = useState('Lunes')
  const [menus, setMenus] = useState(() => loadCache('menuSemanal') || {})
  const [loading, setLoading] = useState(!loadCache('menuSemanal'))

  useEffect(() => {
    getDocs(collection(db, 'menuSemanal')).then(menuSnap => {
      const m = {}
      menuSnap.docs.forEach(doc => {
        const raw = doc.data()
        const clean = {}
        Object.entries(raw).forEach(([k, v]) => { clean[k.trim()] = typeof v === 'string' ? v.trim() : v })
        const diaKey = clean['día'] || clean['dia']
        m[diaKey] = { ...clean, dia: diaKey }
      })
      setMenus(m)
      saveCache('menuSemanal', m)
      setLoading(false)
    })
  }, [])

  const menu = menus[dia]

  return (
    <div className="alimentos-screen">
      <div className="alimentos-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
          <button className="header-back-btn" style={{margin:0}} onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <FavoritoBtn ruta="/alimentos" />
        </div>
        <h1>Menú del día</h1>
      </div>

      <div className="alimentos-content">
        <div className="comedor-card">
          <div className="comedor-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" width="24" height="24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>
            <div>
              <div className="comedor-name">Comedor Américas</div>
              <div className="comedor-info" style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{display:'flex',alignItems:'center',gap:3}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="12" height="12"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Centro estudiantil
                </span>
                <span style={{display:'flex',alignItems:'center',gap:3}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  12:00 - 17:00
                </span>
              </div>
            </div>
          </div>

          <div className="menu-tabs">
            <div className="menu-label">Ver menú semanal</div>
            <div className="dias-row">
              {dias.map(d => (
                <button key={d} className={`dia-btn ${dia === d ? 'active' : ''}`} onClick={() => setDia(d)}>{d}</button>
              ))}
            </div>
          </div>

          <div className="menu-content">
            {loading ? (
              <div style={{textAlign:'center', padding:16, color:'#6b7280'}}>Cargando menú...</div>
            ) : menu ? (
              <>
                <div className="menu-row"><span className="menu-key">Plato fuerte:</span><span className="menu-val">{menu.plato}</span></div>
                <div className="menu-row"><span className="menu-key">Sopa:</span><span className="menu-val">{menu.sopa}</span></div>
                <div className="menu-row"><span className="menu-key">Guarnición:</span><span className="menu-val">{menu.guarnicion}</span></div>
                <div className="menu-row"><span className="menu-key">Postre:</span><span className="menu-val">{menu.postre}</span></div>
              </>
            ) : (
              <div style={{textAlign:'center', padding:16, color:'#6b7280'}}>No hay menú para este día</div>
            )}
          </div>
        </div>

        {/* Tipos de menú */}
        <div className="tipos-menu-outer">
          <div className="tipos-menu-title">Tipos de menú</div>
          {TIPOS_MENU.map((t, i) => (
            <div key={i} className="tipo-menu-card">
              <div className="tipo-menu-nombre">{t.nombre}</div>
              <div className="tipo-menu-precio">{t.precio}</div>
              <ul className="tipo-menu-lista">
                {t.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { doc, getDoc, getDocs, collection } from 'firebase/firestore'
import { saveCache, loadCache } from '../utils/cache'
import { getFavoritos, PAGINAS_INFO } from '../utils/favoritos'
import BottomNav from '../components/BottomNav'
import mantenimiento from '../assets/mantenimiento.png'
import robot from '../assets/robot.png'
import './Home.css'

const DIAS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const ICONOS_RAPIDOS = {
  '/horario': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  '/calificaciones': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  '/transcript': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  '/pagos': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  '/escolar': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  '/alimentos': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  '/transporte': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <rect x="1" y="6" width="22" height="12" rx="3"/>
      <path d="M16 6V4a1 1 0 00-1-1H9a1 1 0 00-1 1v2"/>
      <circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>
      <line x1="7" y1="11" x2="17" y2="11"/>
    </svg>
  ),
  '/mapa': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  '/comunidad': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
}

const SECCIONES = [
  { titulo: 'Horario', desc: 'Ver tus clases semanales', ruta: '/horario' },
  { titulo: 'Calificaciones', desc: 'Revisa tu rendimiento académico', ruta: '/calificaciones' },
  { titulo: 'Pagos', desc: 'Estado de cuenta y pagos', ruta: '/pagos' },
  { titulo: 'Escolar', desc: 'Centro académico y progreso', ruta: '/escolar' },
  { titulo: 'Avisos', desc: 'Noticias y avisos del campus', ruta: '/avisos' },
  { titulo: 'Eventos', desc: 'Actividades y eventos UDLAP', ruta: '/eventos' },
  { titulo: 'Alimentos', desc: 'Menús y cafeterías', ruta: '/alimentos' },
  { titulo: 'Transporte', desc: 'Rutas de autobús universitario', ruta: '/transporte' },
  { titulo: 'Mapa', desc: 'Mapa del campus', ruta: '/mapa' },
  { titulo: 'Comunidad', desc: 'Servicios del campus', ruta: '/comunidad' },
  { titulo: 'Perfil', desc: 'Tu información personal', ruta: '/profile' },
]

export default function Home() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(() => loadCache('usuario') || { nombre: '', id: '' })
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [todosItems, setTodosItems] = useState([])
  const [favoritos, setFavoritos] = useState(() => getFavoritos())
  const [clasesHoy, setClasesHoy] = useState(() => {
    const horario = loadCache('horario') || {}
    const hoy = DIAS_ES[new Date().getDay()]
    return (horario[hoy] || [])
  })
  const diaHoy = DIAS_ES[new Date().getDay()]

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) {
        const id = user.email.split('@')[0]
        getDoc(doc(db, 'usuarios', id)).then(snap => {
          if (snap.exists()) {
            const data = snap.data()
            setUsuario(data)
            saveCache('usuario', data)
          }
        })
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    getDocs(collection(db, 'Horario')).then(snap => {
      const todo = {}
      snap.docs.forEach(d => {
        const raw = d.data()
        const clean = {}
        Object.entries(raw).forEach(([k, v]) => { clean[k.trim()] = typeof v === 'string' ? v.trim() : v })
        const dia = clean['día'] || clean['dia']
        if (!todo[dia]) todo[dia] = []
        todo[dia].push(clean)
      })
      Object.values(todo).forEach(arr => arr.sort((a, b) => (a.hora || '').localeCompare(b.hora || '')))
      saveCache('horario', todo)
      setClasesHoy(todo[diaHoy] || [])
    })
  }, [])

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'eventos')),
      getDocs(collection(db, 'avisos')),
    ]).then(([evSnap, avSnap]) => {
      const eventos = evSnap.docs.map(d => ({
        titulo: d.data().titulo,
        desc: d.data().lugar || '',
        ruta: '/eventos'
      }))
      const avisos = avSnap.docs.map(d => ({
        titulo: d.data().titulo,
        desc: d.data().desc || '',
        ruta: '/avisos'
      }))
      setTodosItems([...SECCIONES, ...eventos, ...avisos])
    })
  }, [])

  const handleBusqueda = (texto) => {
    setBusqueda(texto)
    if (!texto.trim()) { setResultados([]); return }
    const q = texto.toLowerCase()
    setResultados(
      todosItems.filter(item =>
        (item.titulo || '').toLowerCase().includes(q) || (item.desc || '').toLowerCase().includes(q)
      ).slice(0, 6)
    )
  }

  // Refresh favorites when Home is focused
  useEffect(() => {
    const refresh = () => setFavoritos(getFavoritos())
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  const iniciales = usuario.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '...'

  return (
    <div className="home-screen">
      <div className="home-header">
        <div className="user-info" onClick={() => navigate('/profile')}>
          <div className="avatar">{iniciales}</div>
          <div>
            <div className="user-name">{usuario.nombre || 'Cargando...'}</div>
            <div className="user-id">ID: {usuario.id || ''}</div>
          </div>
        </div>
      </div>

      <div className="home-content">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            value={busqueda}
            onChange={e => handleBusqueda(e.target.value)}
            style={{border:'none', outline:'none', background:'transparent', flex:1, fontSize:14, color:'#374151'}}
          />
          {busqueda && (
            <button onClick={() => handleBusqueda('')} style={{background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:16}}>✕</button>
          )}
        </div>

        {resultados.length > 0 && (
          <div className="search-results">
            {resultados.map((r, i) => (
              <div key={i} className="search-result-item" onClick={() => { navigate(r.ruta); setBusqueda(''); setResultados([]) }}>
                <div className="search-result-title">{r.titulo}</div>
                <div className="search-result-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        )}

        {busqueda && resultados.length === 0 && (
          <div className="search-results">
            <div className="search-result-item">
              <div className="search-result-title" style={{color:'#9ca3af'}}>Sin resultados para "{busqueda}"</div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>Clases de hoy — {diaHoy}</h3>
            <button className="ver-todos" onClick={() => navigate('/horario')}>Ver todos</button>
          </div>
          {clasesHoy.length === 0 ? (
            <div style={{textAlign:'center', padding:'16px 0', color:'#9ca3af', fontSize:13}}>
              No hay clases hoy
            </div>
          ) : clasesHoy.map((c, i) => {
            const [h, m] = (c.hora || '00:00').split(':')
            const hora = parseInt(h)
            const ampm = hora >= 12 ? 'p.m.' : 'a.m.'
            const hora12 = hora > 12 ? hora - 12 : hora
            return (
              <div className="class-item" key={i}>
                <div className="class-time">
                  <span>{String(hora12).padStart(2,'0')}:{m}</span>
                  <span>{ampm}</span>
                </div>
                <div className="class-info">
                  <div className="class-name">{c.nombre}</div>
                  <div className="class-room">Salón: {c.aula}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="section-header">
          <h3>Accesos rápidos</h3>
          <span style={{fontSize:11, color:'#9ca3af', display:'flex', alignItems:'center', gap:3}}>
            Marca <svg viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="1.5" width="12" height="12"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> en cada página
          </span>
        </div>
        <div className="quick-access">
          {favoritos.length === 0 ? (
            <div style={{fontSize:13, color:'#9ca3af', padding:'8px 0'}}>
              Toca la estrella en cualquier página para agregarla aquí
            </div>
          ) : favoritos.map(ruta => {
            const info = PAGINAS_INFO[ruta]
            if (!info) return null
            return (
              <button key={ruta} className="quick-btn" onClick={() => navigate(ruta)}>
                <div className="quick-icon" style={{background: info.color}}>
                  {ICONOS_RAPIDOS[ruta]}
                </div>
                <span>{info.titulo}</span>
              </button>
            )
          })}
        </div>

        <div className="section-header">
          <h3>Avisos</h3>
          <button className="ver-todos" onClick={() => navigate('/avisos')}>Ver todos</button>
        </div>
        <div className="notices-row">
          <div className="notice-card">
            <div className="notice-img" style={{background:'#d1d5db', overflow:'hidden'}}>
              <img src={mantenimiento} alt="Mantenimiento" style={{width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 0%'}} />
            </div>
            <div className="notice-body">
              <div className="notice-title">Mantenimiento del campus</div>
              <div className="notice-desc">La biblioteca principal estará cerrada por mantenimiento el 5 de marzo.</div>
              <div className="notice-time">Hace 2 horas</div>
            </div>
          </div>
          <div className="notice-card">
            <div className="notice-img" style={{background:'#6b7280'}}></div>
            <div className="notice-body">
              <div className="notice-title">Recordatorio</div>
              <div className="notice-desc">El plazo para el pago de colegiatura vence pronto.</div>
              <div className="notice-time">Hace 1 día</div>
            </div>
          </div>
        </div>

        <div className="section-header">
          <h3>Eventos</h3>
          <button className="ver-todos" onClick={() => navigate('/eventos')}>Ver todos</button>
        </div>
        <div className="events-row">
          <div className="event-card">
            <div style={{width:'100%', height:90, overflow:'hidden', borderRadius:'12px 12px 0 0'}}>
              <img src={robot} alt="Feria de tecnología" style={{width:'100%', height:'100%', objectFit:'cover', objectPosition:'left 35%'}} />
            </div>
            <div className="event-date"><span className="day">10</span><span className="month">MAR</span></div>
            <div className="event-body">
              <div className="event-title">Feria de tecnología</div>
              <div className="event-desc">Descubre las últimas innovaciones tecnológicas presentadas por estudiantes.</div>
              <div className="event-location">Auditorio principal • 10:00 AM</div>
            </div>
          </div>
          <div className="event-card">
            <div className="event-date"><span className="day">15</span><span className="month">MAR</span></div>
            <div className="event-body">
              <div className="event-title">Torneo deportivo</div>
              <div className="event-desc">Participa en el torneo entre facultades.</div>
              <div className="event-location">Campo deportivo</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import FavoritoBtn from '../components/FavoritoBtn'
import BottomNav from '../components/BottomNav'
import './Mapa.css'

const LUGAR_ICONOS = {
  'Académico':     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  'Instalaciones': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  'Comida':        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  'Residencia':    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  'Deportivo':     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  'Servicios':     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

// Coordenadas verificadas con Nominatim — campus UDLAP San Andrés Cholula
// Bounding box campus: lat 19.051–19.058, lon -98.296–-98.279
const lugares = [
  { nombre: 'Biblioteca',                    tipo: 'Académico',     color: '#3b82f6', coords: [19.0550, -98.2843] },
  { nombre: 'Edificio de Ingeniería (BI)',    tipo: 'Académico',     color: '#3b82f6', coords: [19.0558, -98.2865] },
  { nombre: 'Edificio de Negocios (MN)',      tipo: 'Académico',     color: '#3b82f6', coords: [19.0553, -98.2872] },
  { nombre: 'Edificio de Artes y Ciencias',  tipo: 'Académico',     color: '#3b82f6', coords: [19.0556, -98.2855] },
  { nombre: 'Laboratorios A',                tipo: 'Académico',     color: '#3b82f6', coords: [19.0561, -98.2877] },
  { nombre: 'Auditorio Miguel Covarrubias',  tipo: 'Instalaciones', color: '#a855f7', coords: [19.0545, -98.2858] },
  { nombre: 'Centro Estudiantil',            tipo: 'Instalaciones', color: '#a855f7', coords: [19.0538, -98.2839] },
  { nombre: 'Rectoría',                      tipo: 'Instalaciones', color: '#a855f7', coords: [19.0548, -98.2833] },
  { nombre: 'Ágora',                         tipo: 'Instalaciones', color: '#a855f7', coords: [19.0534, -98.2843] },
  { nombre: 'Comedor Américas',              tipo: 'Comida',        color: '#f97316', coords: [19.0535, -98.2850] },
  { nombre: 'Punta del Cielo',              tipo: 'Comida',        color: '#f97316', coords: [19.0533, -98.2837] },
  { nombre: 'Dominicana',                   tipo: 'Comida',        color: '#f97316', coords: [19.0563, -98.2883] },
  { nombre: 'Colegio Cain-Murray',           tipo: 'Residencia',    color: '#22c55e', coords: [19.0571, -98.2873] },
  { nombre: 'Colegio Ray Lindley',           tipo: 'Residencia',    color: '#22c55e', coords: [19.0568, -98.2857] },
  { nombre: 'Colegio Ignacio Bernal',        tipo: 'Residencia',    color: '#22c55e', coords: [19.0566, -98.2842] },
  { nombre: 'Colegio Morris "Moe" Williams', tipo: 'Residencia',    color: '#22c55e', coords: [19.0573, -98.2862] },
  { nombre: 'Gimnasio MOE Williams',         tipo: 'Deportivo',     color: '#ef4444', coords: [19.0576, -98.2868] },
  { nombre: 'Canchas de Fútbol',             tipo: 'Deportivo',     color: '#ef4444', coords: [19.0578, -98.2848] },
  { nombre: 'Alberca Olímpica',              tipo: 'Deportivo',     color: '#ef4444', coords: [19.0575, -98.2885] },
  { nombre: 'Tienda Universitaria',          tipo: 'Servicios',     color: '#6b7280', coords: [19.0540, -98.2827] },
  { nombre: 'Salud Estudiantil',             tipo: 'Servicios',     color: '#6b7280', coords: [19.0543, -98.2822] },
]

const categorias = ['Todos', 'Académico', 'Comida', 'Residencia', 'Instalaciones', 'Deportivo', 'Servicios']

function createIcon(color) {
  return L.divIcon({
    className: '',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

function MapAutoZoom({ filtered }) {
  const map = useMap()
  const key = filtered.map(l => l.nombre).join(',')
  useEffect(() => {
    if (!filtered.length) return
    if (filtered.length === 1) {
      map.flyTo(filtered[0].coords, 18, { duration: 0.8 })
    } else {
      const bounds = L.latLngBounds(filtered.map(l => l.coords))
      map.flyToBounds(bounds, { padding: [50, 50], duration: 0.8, maxZoom: 18 })
    }
  }, [key])
  return null
}

// Centro verificado de UDLAP
const UDLAP_CENTER = [19.0545, -98.2850]

export default function Mapa() {
  const navigate = useNavigate()
  const [cat, setCat] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  const filtered = lugares.filter(l => {
    const matchCat = cat === 'Todos' || l.tipo === cat
    const matchBusqueda = l.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchCat && matchBusqueda
  })

  return (
    <div className="mapa-screen">
      <div className="mapa-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
          <button className="header-back-btn" style={{margin:0}} onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <FavoritoBtn ruta="/mapa" />
        </div>
        <h1>Mapa del campus</h1>
        <div className="mapa-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            placeholder="Buscar un lugar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'#9ca3af',fontSize:16,lineHeight:1}}>✕</button>
          )}
        </div>
        <div className="cat-tabs">
          {categorias.map(c => (
            <button key={c} className={`cat-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="mapa-visual">
        <MapContainer
          center={UDLAP_CENTER}
          zoom={16}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          {/* Satélite Esri — muestra edificios reales */}
          <TileLayer
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          {/* Capa de etiquetas/nombres encima del satélite */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          />
          <MapAutoZoom filtered={filtered} />
          {filtered.map((l, i) => (
            <Marker key={`${l.nombre}-${i}`} position={l.coords} icon={createIcon(l.color)}>
              <Popup>
                <div style={{fontFamily:'sans-serif', minWidth:150}}>
                  <strong style={{fontSize:13, color:'#1f2937', display:'block', marginBottom:2}}>{l.nombre}</strong>
                  <span style={{fontSize:11, color:'#6b7280'}}>{l.tipo}</span>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.nombre + ' UDLAP Cholula Puebla')}`, '_blank')}
                    style={{display:'block', marginTop:8, width:'100%', padding:'6px 0', background:'#ef4444', color:'white', border:'none', borderRadius:6, fontSize:12, cursor:'pointer', fontWeight:600}}
                  >
                    Abrir en Google Maps
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <button
          className="gmaps-btn"
          onClick={() => window.open('https://maps.app.goo.gl/KpK6YQzJqSvK3NHz5', '_blank')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          Google Maps
        </button>
      </div>

      <div className="lugares-content">
        <h3>{busqueda || cat !== 'Todos' ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}` : 'Todos los lugares'}</h3>
        {filtered.length === 0 && (
          <div style={{textAlign:'center', color:'#9ca3af', padding:'24px 0', fontSize:14}}>No se encontraron lugares</div>
        )}
        {filtered.map((l, i) => (
          <div className="lugar-item" key={i}>
            <div className="lugar-icon" style={{background: l.color + '20', color: l.color}}>
              {LUGAR_ICONOS[l.tipo]}
            </div>
            <div className="lugar-info">
              <div className="lugar-nombre">{l.nombre}</div>
              <div className="lugar-tipo">{l.tipo}</div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        ))}

        <div className="simbologia">
          <h4>Simbología</h4>
          <div className="sim-grid">
            <div className="sim-item"><span className="sim-dot" style={{background:'#3b82f6'}} /> Académico</div>
            <div className="sim-item"><span className="sim-dot" style={{background:'#f97316'}} /> Comida</div>
            <div className="sim-item"><span className="sim-dot" style={{background:'#22c55e'}} /> Residencia</div>
            <div className="sim-item"><span className="sim-dot" style={{background:'#a855f7'}} /> Instalaciones</div>
            <div className="sim-item"><span className="sim-dot" style={{background:'#ef4444'}} /> Deportivo</div>
            <div className="sim-item"><span className="sim-dot" style={{background:'#6b7280'}} /> Servicios</div>
          </div>
        </div>
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

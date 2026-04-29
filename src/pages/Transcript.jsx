import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { saveCache, loadCache } from '../utils/cache'
import FavoritoBtn from '../components/FavoritoBtn'
import BottomNav from '../components/BottomNav'
import './Transcript.css'

// Más antiguo primero — el transcript académico se lee cronológicamente, al revés de Calificaciones.
const ORDEN_CRONOLOGICO = ['Primavera 2025', 'Otoño 2025', 'Primavera 2026']

export default function Transcript() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)
  const [openCarrera, setOpenCarrera] = useState(null)
  const [usuario, setUsuario] = useState(() => loadCache('usuario'))
  const [historial, setHistorial] = useState(() => loadCache('calificaciones') || [])
  const [loading, setLoading] = useState(!loadCache('usuario') || !loadCache('calificaciones'))

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async user => {
      if (!user) return
      const id = user.email.split('@')[0]

      // Datos del alumno
      const snap = await getDoc(doc(db, 'usuarios', id))
      if (snap.exists()) {
        const raw = snap.data()
        const clean = {}
        Object.entries(raw).forEach(([k, v]) => {
          clean[k.trim()] = typeof v === 'string' ? v.trim() : v
        })
        setUsuario(clean)
        saveCache('usuario', clean)
      }

      // Historial de calificaciones agrupado por periodo
      const calSnap = await getDocs(collection(db, 'usuarios', id, 'calificaciones'))
      const grupos = {}
      calSnap.docs.forEach(d => {
        const raw = d.data()
        const clean = {}
        Object.entries(raw).forEach(([k, v]) => {
          clean[k.trim()] = typeof v === 'string' ? v.trim() : v
        })
        if (typeof clean.cal !== 'number') clean.cal = null
        const label = clean.periodo
        if (!grupos[label]) grupos[label] = []
        grupos[label].push(clean)
      })

      const lista = ORDEN_CRONOLOGICO.filter(l => grupos[l]).map(label => ({
        periodo: label,
        materias: grupos[label],
      }))

      setHistorial(lista)
      saveCache('calificaciones', lista)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) return (
    <div style={{textAlign:'center', padding:64, color:'#6b7280'}}>Cargando transcript...</div>
  )

  const carrera = usuario?.Carrera ?? usuario?.carrera ?? '—'
  const carreras = usuario?.carreras ?? null
  const progresoCarreras = usuario?.progresoCarreras ?? null
  const periodoIngreso = usuario?.['Periodo de ingreso'] ?? usuario?.['periodo de ingreso'] ?? '—'
  const nombre = usuario?.nombre ?? '—'
  const id = usuario?.id ?? '—'
  const promedio = usuario?.Promedio ?? usuario?.promedio ?? '—'

  // Última inscripción = periodo más reciente con materias
  const ultimaInscripcion = historial.length ? historial[historial.length - 1].periodo : '—'

  return (
    <div className="transcript-screen">
      <div className="transcript-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
          <button className="header-back-btn" style={{margin:0}} onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <FavoritoBtn ruta="/transcript" />
        </div>
        <h1>Transcript</h1>
      </div>

      <div className="transcript-content">
        <div className="t-section">
          <div className="t-section-title" style={{display:'flex',alignItems:'center',gap:6}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            Datos del alumno
          </div>
          <div className="t-card">
            <div className="t-row"><span>Nombre:</span><strong>{nombre}</strong></div>
            <div className="t-row"><span>ID:</span><strong>{id}</strong></div>
            <div className="t-row"><span>Promedio general:</span><strong>{promedio}</strong></div>
          </div>
        </div>

        <div className="t-section">
          <div className="t-section-title">Datos generales del programa</div>
          {carreras ? (
            carreras.map((c, i) => {
              const prog = progresoCarreras?.[i]
              const isOpen = openCarrera === i
              return (
                <div className="t-card" key={i} style={{ marginBottom: 10, padding: 0, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenCarrera(isOpen ? null : i)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '12px 16px', background: 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div>
                      <div className="t-program" style={{ margin: 0 }}>{c}</div>
                      <div style={{ fontSize: 11, color: '#f97316', fontWeight: 600, marginTop: 2 }}>Carrera {i + 1}</div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
                      style={{ width: 18, height: 18, flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : '', transition: '0.2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 16px 12px' }}>
                      <div className="t-row"><span>Tipo de programa:</span><strong>Presencial</strong></div>
                      <div className="t-row"><span>Periodo de ingreso:</span><strong>{periodoIngreso}</strong></div>
                      <div className="t-row"><span>Última inscripción:</span><strong>{ultimaInscripcion}</strong></div>
                      {prog && <div className="t-row"><span>Créditos acreditados:</span><strong>{prog.creditos} / {prog.total}</strong></div>}
                      <div className="t-row"><span>Fecha de grado conferido:</span><strong>—</strong></div>
                      <div className="t-row"><span>Estatus del alumno:</span><strong className="green">Regular</strong></div>
                      <div className="t-row"><span>Estatus transcript:</span><strong className="green">Abierto</strong></div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="t-card">
              <div className="t-program">{carrera}</div>
              <div className="t-row"><span>Tipo de programa:</span><strong>Presencial</strong></div>
              <div className="t-row"><span>Periodo de ingreso:</span><strong>{periodoIngreso}</strong></div>
              <div className="t-row"><span>Última inscripción:</span><strong>{ultimaInscripcion}</strong></div>
              <div className="t-row"><span>Fecha de grado conferido:</span><strong>—</strong></div>
              <div className="t-row"><span>Estatus del alumno:</span><strong className="green">Regular</strong></div>
              <div className="t-row"><span>Estatus transcript:</span><strong className="green">Abierto</strong></div>
            </div>
          )}
        </div>

        <div className="t-section">
          <div className="t-section-title">Exámenes de ubicación</div>
          <div className="t-card">
            <div className="t-row"><span>Examen de ubicación de inglés Ver. 2011 (040)</span><strong>ING0562- (94)</strong></div>
          </div>
        </div>

        <div className="t-section-title">Historial</div>
        {historial.length === 0 && (
          <p style={{color:'#9ca3af', fontSize:14, textAlign:'center', padding:'16px 0'}}>Sin historial disponible.</p>
        )}
        {historial.map((h, i) => (
          <div key={i} className="periodo-card">
            <button className="periodo-toggle" onClick={() => setOpen(open === i ? null : i)}>
              <span>{h.periodo}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
                style={{width:18, height:18, transform: open===i?'rotate(180deg)':'', transition:'0.2s'}}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {open === i && (
              <div className="periodo-materias">
                {h.materias.map((m, j) => (
                  <div key={j} className="periodo-materia">
                    <div className="pm-info">
                      <span className="pm-clave">{m.clave}</span>
                      <span className="pm-nombre">{m.nombre}</span>
                      <span className="pm-cred">{m.creditos} créditos</span>
                    </div>
                    <span className={`pm-cal ${m.cal == null ? 'pm-pendiente' : m.cal <= 7.5 ? 'pm-reprobada' : ''}`}>
                      {m.cal ?? 'Pend.'}
                    </span>
                  </div>
                ))}
                <div className="periodo-resumen">
                  <span>Créditos del periodo:</span>
                  <strong>{h.materias.reduce((s, m) => s + (m.creditos || 0), 0)}</strong>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="t-disclaimer">
          Este es un historial académico no oficial solo para fines informativos. Para un historial oficial, por favor contacta a Dirección Escolar o solicita a través del portal estudiantil.
        </div>
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

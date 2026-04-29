import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { saveCache, loadCache } from '../utils/cache'
import FavoritoBtn from '../components/FavoritoBtn'
import BottomNav from '../components/BottomNav'
import './Horario.css'

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

export default function Horario() {
  const navigate = useNavigate()
  const [dia, setDia] = useState('Lunes')
  const [clases, setClases] = useState(() => loadCache('horario') || {})
  const [loading, setLoading] = useState(!loadCache('horario'))
  const [vista, setVista] = useState('lista') // 'lista' | 'calendario'

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) return
      const id = user.email.split('@')[0]
      getDocs(collection(db, 'usuarios', id, 'horario')).then(snap => {
        const data = {}
        snap.docs.forEach(doc => {
          const raw = doc.data()
          const clean = {}
          Object.entries(raw).forEach(([k, v]) => {
            clean[k.trim()] = typeof v === 'string' ? v.trim() : v
          })
          const c = {
            dia: clean['día'] || clean['dia'],
            hora: clean.hora,
            nombre: clean.nombre,
            aula: clean.aula,
            prof: clean.profesor || clean.prof,
            tipo: clean.tipo,
          }
          if (!data[c.dia]) data[c.dia] = []
          data[c.dia].push(c)
        })
        dias.forEach(d => { if (data[d]) data[d].sort((a, b) => a.hora.localeCompare(b.hora)) })
        setClases(data)
        saveCache('horario', data)
        setLoading(false)
      }).catch(err => console.error('Error Firestore:', err))
    })
    return () => unsub()
  }, [])

  // Genera un archivo .ics (iCalendar) con eventos semanales recurrentes hasta fin de semestre.
  // En iOS Safari, descargar un .ics abre directamente el diálogo "Agregar al Calendario".
  function exportar() {
    // Primera fecha de cada día en el semestre Primavera 2026
    const FECHA_INICIO = {
      'Lunes':     '20260126',
      'Martes':    '20260127',
      'Miércoles': '20260128',
      'Jueves':    '20260129',
      'Viernes':   '20260130',
    }
    const BYDAY = {
      'Lunes': 'MO', 'Martes': 'TU',
      'Miércoles': 'WE', 'Jueves': 'TH', 'Viernes': 'FR',
    }
    const HASTA = '20260529T235959Z'

    // Parsea "HH:MM-HH:MM" o "HH:MM" (asume 1h30m si no hay fin)
    function parseHora(hora = '') {
      const [startRaw, endRaw] = hora.split('-')
      const [sh, sm] = (startRaw || '07:00').trim().split(':')
      const startH = (sh || '07').padStart(2, '0')
      const startM = (sm || '00').padStart(2, '0')
      let endH, endM
      if (endRaw) {
        const [eh, em] = endRaw.trim().split(':')
        endH = (eh || '08').padStart(2, '0')
        endM = (em || '30').padStart(2, '0')
      } else {
        const total = parseInt(startH) * 60 + parseInt(startM) + 90
        endH = String(Math.floor(total / 60)).padStart(2, '0')
        endM = String(total % 60).padStart(2, '0')
      }
      return { startH, startM, endH, endM }
    }

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UDLAPLife//Horario Primavera 2026//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Horario UDLAP Primavera 2026',
      'X-WR-TIMEZONE:America/Mexico_City',
    ]

    dias.forEach(d => {
      (clases[d] || []).forEach(c => {
        const fecha = FECHA_INICIO[d]
        const byday = BYDAY[d]
        const { startH, startM, endH, endM } = parseHora(c.hora)
        const uid = `udlaplife-${fecha}-${startH}${startM}-${Math.random().toString(36).slice(2, 9)}@udlap.mx`

        lines.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTART;TZID=America/Mexico_City:${fecha}T${startH}${startM}00`,
          `DTEND;TZID=America/Mexico_City:${fecha}T${endH}${endM}00`,
          `RRULE:FREQ=WEEKLY;BYDAY=${byday};UNTIL=${HASTA}`,
          `SUMMARY:${c.nombre || 'Clase'}`,
          `LOCATION:${c.aula || ''}`,
          `DESCRIPTION:Profesor: ${c.prof || '—'} | Tipo: ${c.tipo || '—'} | UDLAP`,
          'STATUS:CONFIRMED',
          'TRANSP:OPAQUE',
          'END:VEVENT',
        )
      })
    })

    lines.push('END:VCALENDAR')

    const icsContent = lines.join('\r\n')
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    // En iOS Safari abre el .ics directamente → aparece "Agregar al Calendario"
    const a = document.createElement('a')
    a.href = url
    a.download = 'horario_primavera2026.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="horario-screen">
      <div className="horario-header">
        <div className="horario-header-top">
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <button className="header-back-btn" onClick={() => navigate(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div>
              <h1>Horario</h1>
              <p className="horario-period">Primavera 2026</p>
            </div>
          </div>
          <div className="horario-actions">
            <FavoritoBtn ruta="/horario" />
            <button className="btn-exportar" onClick={exportar}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exportar
            </button>
            <div className="vista-toggle">
              <button
                className={`vista-btn ${vista === 'lista' ? 'active' : ''}`}
                onClick={() => setVista('lista')}
                title="Vista lista"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
              <button
                className={`vista-btn ${vista === 'calendario' ? 'active' : ''}`}
                onClick={() => setVista('calendario')}
                title="Vista calendario"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <line x1="8" y1="14" x2="8" y2="14"/>
                  <line x1="12" y1="14" x2="12" y2="14"/>
                  <line x1="16" y1="14" x2="16" y2="14"/>
                  <line x1="8" y1="18" x2="8" y2="18"/>
                  <line x1="12" y1="18" x2="12" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dias-nav">
        {dias.map(d => (
          <button
            key={d}
            className={`dia-btn ${dia === d ? 'active' : ''}`}
            onClick={() => setDia(d)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="horario-content">
        {loading ? (
          <div style={{textAlign:'center', padding:32, color:'#6b7280'}}>Cargando horario...</div>
        ) : vista === 'lista' ? (
          <>
            {(clases[dia] || []).length === 0 && (
              <div style={{textAlign:'center', padding:32, color:'#6b7280'}}>No hay clases este día</div>
            )}
            {(clases[dia] || []).map((c, i) => (
              <div className="clase-card" key={i}>
                <div className="clase-hora">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{c.hora}</span>
                  <span className={`tipo-badge ${c.tipo === 'Laboratorio' ? 'lab' : 'clase'}`}>{c.tipo}</span>
                </div>
                <div className="clase-nombre">{c.nombre}</div>
                <div className="clase-detalle">
                  <span style={{display:'flex',alignItems:'center',gap:4}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {c.aula}
                  </span>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {c.prof}
                  </span>
                </div>
              </div>
            ))}
          </>
        ) : (
          /* Vista calendario — columnas por día */
          <div className="cal-grid">
            {dias.map(d => (
              <div key={d} className="cal-col">
                <div className="cal-dia-label">{d.slice(0, 3)}</div>
                {(clases[d] || []).map((c, i) => (
                  <div key={i} className={`cal-clase ${c.tipo === 'Laboratorio' ? 'cal-lab' : 'cal-normal'}`}>
                    <div className="cal-hora">{c.hora}</div>
                    <div className="cal-nombre">{c.nombre}</div>
                  </div>
                ))}
                {!(clases[d] || []).length && (
                  <div className="cal-libre">—</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

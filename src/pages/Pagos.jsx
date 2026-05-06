import { useState, useEffect } from 'react'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { jsPDF } from 'jspdf'
import { saveCache, loadCache } from '../utils/cache'
import FavoritoBtn from '../components/FavoritoBtn'
import BottomNav from '../components/BottomNav'
import './Pagos.css'

export default function Pagos() {
  const [descargado, setDescargado] = useState(false)
  const [pagos, setPagos] = useState(() => loadCache('pagos'))
  const [movimientos, setMovimientos] = useState(() => loadCache('movimientos') || [])
  const [loading, setLoading] = useState(!loadCache('pagos'))
  const [showBancos, setShowBancos] = useState(false)
  const [showFacturacion, setShowFacturacion] = useState(false)
  const [showContactos, setShowContactos] = useState(false)
  const [busqContacto, setBusqContacto] = useState('')
  const [copiado, setCopiado] = useState('')

  const CONTACTOS = [
    { seccion: 'PAGOS Y COLEGIATURAS', items: [
      { nombre: 'Consultas de saldos',                        ext: '2012',        email: 'pagos@udlap.mx' },
      { nombre: 'Pago electrónico (Portal multipagos UDLAP)', ext: '2014',        email: 'pagos@udlap.mx' },
      { nombre: 'Facturación',                                ext: '4619 / 4311', email: 'facturacion@udlap.mx' },
      { nombre: 'Seguro de gastos médicos mayores',           ext: '4860',        email: 'seguro@udlap.mx' },
      { nombre: 'Maestrías por Internet',                     ext: '4553',        email: 'maestrias@udlap.mx' },
      { nombre: 'Colegios residenciales',                     ext: '2510',        email: 'colegios@udlap.mx' },
      { nombre: 'Sorteo UDLAP',                               ext: '2106',        email: 'sorteo@udlap.mx' },
      { nombre: 'Servicios Escolares',                        ext: '2017',        email: 'servicios.escolares@udlap.mx' },
      { nombre: 'Becas',                                      ext: '5235',        email: 'becas@udlap.mx' },
      { nombre: 'Becas nuevo ingreso',                        ext: '2702',        email: 'becas@udlap.mx' },
      { nombre: 'Becas de reingreso',                                ext: '4256',        email: 'becas@udlap.mx' },
      { nombre: 'Becas deportivas',                                  ext: '2382',        email: 'becas.deportivas@udlap.mx' },
      { nombre: 'Programa UNE',                                      ext: '3266',        email: 'une@udlap.mx' },
      { nombre: 'Créditos Educativos UDLAP y Santander Serfín',      ext: '4168 / 2010', email: 'creditos@udlap.mx' },
      { nombre: 'Talleres deportivos y torneos intramuros',          ext: '2383 / 6506', email: 'deportes@udlap.mx' },
      { nombre: 'Talleres recreativos',                              ext: '4070 / 4567', email: 'recreacion@udlap.mx' },
    ]},
  ]

  function copiar(texto, label) {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(label)
      setTimeout(() => setCopiado(''), 2000)
    })
  }

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async user => {
      if (user) {
        const id = user.email.split('@')[0]
        const [userSnap, movSnap] = await Promise.all([
          getDoc(doc(db, 'usuarios', id)),
          getDocs(collection(db, 'usuarios', id, 'movimientos'))
        ])
        if (userSnap.exists()) {
          const raw = userSnap.data()
          const data = {}
          Object.entries(raw).forEach(([k, v]) => {

            data[k.trim()] = typeof v === 'string' ? v.trim() : v
          })
          const pagosData = {
            nombre: data.nombre ?? '-',
            id: data.id ?? '-',
            direccion: data['Dirección'] ?? data.direccion ?? '-',
            telefono: data.telefono ?? '-',
            correo: data.correo ?? '-',
            carrera: data.Carrera ?? data.carrera ?? '-',
            creditos: data.creditos ?? '-',
            inscritas: data.inscritas ?? '-',
            porAcreditar: data.porAcreditar ?? '-',
            periodo: data.periodo ?? '-',
            saldoExigible: data.saldoExigible ?? '0.00',
            fechaLimite: data.fechaLimite ?? '-',
            saldoTotal: data.saldoTotal ?? '0.00',
            apoyoNombre: data.apoyoNombre ?? '-',
            apoyoPct: data.apoyoPct ?? '-',
          }
          setPagos(pagosData)
          saveCache('pagos', pagosData)
        }
        // Normaliza dos esquemas de movimientos: usuario 181062 usa {titulo, cargo, abono, saldo}
        // mientras que usuario 184020 usa {concepto, monto, tipo}. Se unifica antes de renderizar.
        let saldoAcum = 0
        const movData = movSnap.docs.map(d => {
          const raw = { id: d.id, ...d.data() }
          const titulo = raw.titulo || raw.concepto || '-'
          const fecha = raw.fecha || '-'
          if (raw.cargo !== undefined) {
            return { ...raw, titulo, fecha }
          }
          const m = raw.monto || 0
          const cargo = m < 0 ? Math.abs(m).toFixed(2) : '0.00'
          const abono = m > 0 ? m.toFixed(2) : '0.00'
          saldoAcum = Math.max(0, saldoAcum + (m < 0 ? Math.abs(m) : -m))
          return { id: raw.id, titulo, fecha, monto: Math.abs(m), cargo, abono, saldo: saldoAcum.toFixed(2) }
        })
        setMovimientos(movData)
        saveCache('movimientos', movData)
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const handleDescargar = () => {
    const pdf = new jsPDF()
    const ahora = new Date()
    const fechaHora = ahora.toLocaleDateString('es-MX') + ' ' + ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    const W = 210

    // Encabezado superior
    pdf.setFontSize(8)
    pdf.setTextColor(100)
    pdf.text(fechaHora, 14, 8)
    pdf.text('Estado de Cuenta Estudiante', W / 2, 8, { align: 'center' })

    // Barra UDLAP
    pdf.setFillColor(245, 245, 245)
    pdf.rect(0, 12, W, 14, 'F')
    pdf.setFillColor(230, 100, 20)
    pdf.rect(14, 14, 18, 10, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text('UDLAP', 15.5, 20.5)
    pdf.setTextColor(230, 100, 20)
    pdf.setFontSize(13)
    pdf.text('Consulta de Estado de Cuenta Estudiante', 36, 20.5)

    // Línea naranja
    pdf.setDrawColor(230, 100, 20)
    pdf.setLineWidth(0.5)
    pdf.line(14, 26, W - 14, 26)

    // Nota oficial
    pdf.setFontSize(8)
    pdf.setTextColor(230, 100, 20)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Este no es un documento oficial', 14, 31)

    // Info alumno (columna izquierda)
    pdf.setTextColor(50, 50, 50)
    pdf.setFontSize(9)
    const infoIzq = [
      ['ID', pagos?.id || '-'],
      ['NOMBRE COMPLETO', pagos?.nombre || '-'],
      ['DOMICILIO', pagos?.direccion || '-'],
      ['TÉLEFONO', pagos?.telefono || '-'],
      ['E-MAIL', pagos?.correo || '-'],
    ]
    let y = 40
    infoIzq.forEach(([label, val]) => {
      pdf.setFont('helvetica', 'bold')
      pdf.text(label, 14, y)
      pdf.setFont('helvetica', 'normal')
      pdf.text(val, 50, y)
      y += 7
    })

    // Info cuenta (columna derecha)
    const infoDer = [
      ['FECHA DE CONSULTA', fechaHora],
      ['PERIODO', pagos?.periodo || '-'],
      ['SALDO EXIGIBLE', `$${pagos?.saldoExigible || '0.00'}`],
      ['FECHA LÍMITE DE PAGO', pagos?.fechaLimite || '-'],
      ['SALDO TOTAL', `$${pagos?.saldoTotal || '0.00'}`],
    ]
    let y2 = 40
    infoDer.forEach(([label, val]) => {
      pdf.setFont('helvetica', 'bold')
      pdf.text(label, 120, y2)
      pdf.setFont('helvetica', 'normal')
      pdf.text(val, 170, y2)
      y2 += 7
    })

    // Tabla programa
    y = 82
    pdf.setFillColor(220, 220, 220)
    pdf.rect(14, y, W - 28, 7, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(30, 30, 30)
    pdf.text('Programa', 16, y + 5)
    pdf.text('Unidades acreditadas', 90, y + 5)
    pdf.text('Unidades Inscritas', 130, y + 5)
    pdf.text('Unidades por acreditar', 162, y + 5)
    y += 7
    pdf.setFont('helvetica', 'normal')
    pdf.text(String(pagos?.carrera || 'INGENIERÍA EN SISTEMAS COMPUTACIONALES'), 16, y + 5)
    pdf.text(String(pagos?.creditos || '-'), 100, y + 5)
    pdf.text(String(pagos?.inscritas || '-'), 140, y + 5)
    pdf.text(String(pagos?.porAcreditar || '-'), 172, y + 5)
    y += 12

    // Tabla movimientos
    if (movimientos.length > 0) {
      pdf.setFillColor(60, 60, 60)
      pdf.rect(14, y, W - 28, 7, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      pdf.text('MOVIMIENTOS ANTERIORES', 16, y + 5)
      y += 7

      // Encabezados columnas
      pdf.setFillColor(240, 240, 240)
      pdf.rect(14, y, W - 28, 6, 'F')
      pdf.setTextColor(30, 30, 30)
      pdf.text('Fecha', 16, y + 4)
      pdf.text('Concepto', 45, y + 4)
      pdf.text('Cargo', 130, y + 4)
      pdf.text('Abono', 155, y + 4)
      pdf.text('Saldo', 178, y + 4)
      y += 6

      pdf.setFont('helvetica', 'normal')
      movimientos.forEach((m, i) => {
        if (y > 270) {
          pdf.addPage()
          y = 20
        }
        if (i % 2 === 0) {
          pdf.setFillColor(250, 250, 250)
          pdf.rect(14, y, W - 28, 6, 'F')
        }
        pdf.setTextColor(50, 50, 50)
        pdf.text(m.fecha || '-', 16, y + 4)
        pdf.text(m.concepto || m.titulo || '-', 45, y + 4)
        pdf.text(m.cargo ? String(m.cargo) : '0.00', 130, y + 4)
        pdf.text(m.abono ? String(m.abono) : '0.00', 155, y + 4)
        pdf.text(m.saldo ? String(m.saldo) : '-', 178, y + 4)
        y += 6
      })

      // Línea final saldo
      pdf.setFont('helvetica', 'bold')
      pdf.text('Saldo:', 155, y + 5)
      const ultimo = movimientos[movimientos.length - 1]
      pdf.text(ultimo?.saldo ? String(ultimo.saldo) : '-', 178, y + 5)
    }

    // Footer
    pdf.setFontSize(7)
    pdf.setTextColor(120)
    pdf.setFont('helvetica', 'normal')
    pdf.text('http://aplicaciones.udlap.mx/EstadoDeCuentaEstudiante/MainFlow.Login.aspx', 14, 288)
    pdf.text('1 de 1', W - 14, 288, { align: 'right' })

    const fecha = ahora.toISOString().slice(0, 10)
    pdf.save(`ReporteEstadoCuenta_${pagos?.id || '0'}_${fecha}.pdf`)
    setDescargado(true)
    setTimeout(() => setDescargado(false), 3000)
  }

  const BANCOS = [
    {
      nombre: 'BBVA',
      color: '#00309E',
      convenio: 'CIE 32495',
      referencia: '0018106266',
    },
    {
      nombre: 'Banorte',
      color: '#C0392B',
      convenio: 'Concentración Empresarial de Pagos 94742',
      referencia: '0018106266',
    },
    {
      nombre: 'HSBC',
      color: '#DB0011',
      convenio: 'RAP 8132',
      referencia: '0018106266',
    },
    {
      nombre: 'Citibanamex',
      color: '#056DAE',
      convenio: 'SUCURSAL 870 CUENTA 51642',
      referencia: '0018106266',
    },
    {
      nombre: 'Santander',
      color: '#EC0000',
      convenio: 'Convenio pago referenciado 3560',
      referencia: '0018106266',
    },
  ]

  const MESES = [
    { mes: 'Enero',    fecha: '30/01/2026' },
    { mes: 'Febrero',  fecha: '27/02/2026' },
    { mes: 'Marzo',    fecha: '30/03/2026' },
    { mes: 'Abril',    fecha: '30/04/2026' },
  ]

  const IconCalendar = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" width="22" height="22">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )

  if (showFacturacion) return (
    <div className="pagos-screen">
      <div className="fact-header">
        <button className="bancos-back" onClick={() => setShowFacturacion(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1>Información de facturación</h1>
        <p>Fechas y comprobantes fiscales</p>
      </div>

      <div className="bancos-content">
        <div className="fact-section-title">Calendario</div>

        {MESES.map((m, i) => (
          <div key={i} className="fact-mes-card">
            <div className="fact-mes-header">
              <IconCalendar />
              <span className="fact-mes-nombre">{m.mes}</span>
            </div>
            <div className="fact-mes-fecha">Fecha límite: <strong>{m.fecha}</strong></div>
          </div>
        ))}

        <div className="fact-solicitud-card">
          <div className="fact-solicitud-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" width="22" height="22">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="fact-solicitud-title">Solicitud de factura</span>
          </div>
          <div className="fact-solicitud-desc">Procedimientos y requerimientos</div>
        </div>

        <div className="fact-ayuda-card">
          <div className="fact-ayuda-title">¿Necesitas ayuda?</div>
          <p className="fact-ayuda-desc">Contacta al departamento de finanzas para cualquier duda sobre tu facturación.</p>
          <div className="fact-ayuda-item"><strong>Email:</strong> finanzas@udlap.mx</div>
          <div className="fact-ayuda-item"><strong>Teléfono:</strong> (222) 229-2000 ext. 2345</div>
          <div className="fact-ayuda-item"><strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00</div>
        </div>
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )

  if (showContactos) {
    const itemsFiltrados = CONTACTOS.flatMap(s =>
      s.items.filter(i => i.nombre.toLowerCase().includes(busqContacto.toLowerCase()))
    )
    return (
      <div className="pagos-screen">
        {/* Header */}
        <div className="contactos-header">
          <button className="contactos-close" onClick={() => { setShowContactos(false); setBusqContacto('') }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <h2 className="contactos-header-title">Contactos</h2>
        </div>

        <div className="contactos-content">
          {CONTACTOS.map(sec => (
            <div key={sec.seccion}>
              <div className="contactos-seccion">{sec.seccion}</div>
              {/* Buscador */}
              <div className="contactos-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" width="20" height="20">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  placeholder="Buscar contacto"
                  value={busqContacto}
                  onChange={e => setBusqContacto(e.target.value)}
                />
              </div>

              <div className="contactos-card">
                {itemsFiltrados.map((item, i) => (
                  <div key={i} className="contacto-item">
                    <div className="contacto-nombre">{item.nombre}</div>
                    <div className="contacto-ext-row">
                      <span><strong>Extensión:</strong> {item.ext}</span>
                      <button className="contacto-mail-btn" onClick={() => window.open(`mailto:${item.email}`)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" width="22" height="22">
                          <rect x="2" y="4" width="20" height="16" rx="2"/>
                          <polyline points="2,4 12,13 22,4"/>
                        </svg>
                      </button>
                    </div>
                    {i < itemsFiltrados.length - 1 && <div className="contacto-sep" />}
                  </div>
                ))}
                {itemsFiltrados.length === 0 && (
                  <div style={{textAlign:'center', color:'#9ca3af', padding:16, fontSize:14}}>Sin resultados</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    )
  }

  if (showBancos) return (
    <div className="pagos-screen">
      <div className="bancos-header">
        <button className="bancos-close" onClick={() => setShowBancos(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <h1 className="bancos-header-title">Bancos</h1>
      </div>

      <div className="bancos-ref-box">
        <div className="bancos-ref-hint">Número de referencia</div>
        <div className="bancos-ref-num">{pagos?.id || '—'}</div>
        <div className="bancos-ref-nota">Incluye este número en todos tus pagos</div>
      </div>

      <div className="bancos-list">
        {BANCOS.map((banco, i) => (
          <div key={i} className="banco-item">
            <div className="banco-logo-name" style={{color: banco.color}}>{banco.nombre}</div>
            <div className="banco-dato-row">
              <span className="banco-dato-label">Convenio:</span>
              <span className="banco-dato-val">{banco.convenio}</span>
            </div>
            <div className="banco-dato-row">
              <span className="banco-dato-label">Referencia:</span>
              <span className="banco-dato-val">{banco.referencia}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )

  return (
    <div className="pagos-screen">
      <div className="pagos-header">
        <div className="pagos-header-top">
          <h1>Pagos</h1>
          <div style={{display:'flex', alignItems:'center', gap:4}}>
            <FavoritoBtn ruta="/pagos" />
            <button className="help-btn" onClick={() => setShowContactos(true)}>?</button>
          </div>
        </div>
        <p>Estado de cuenta</p>
        <div className="pago-stat-card"><div className="pstat-label">Saldo exigible</div><div className="pstat-val">{loading ? '...' : `$${pagos?.saldoExigible}`}</div></div>
        <div className="pago-stat-card"><div className="pstat-label">Fecha límite de pago</div><div className="pstat-val">{loading ? '...' : pagos?.fechaLimite}</div></div>
        <div className="pago-stat-card"><div className="pstat-label">Saldo total</div><div className="pstat-val">{loading ? '...' : `$${pagos?.saldoTotal}`}</div></div>
      </div>

      <div className="pagos-content">
        <div className="apoyo-section">
          <h3>Apoyo educativo</h3>
          <div className="apoyo-badge">
            <div className="apoyo-name">{loading ? '...' : pagos?.apoyoNombre}</div>
            <div className="apoyo-pct">{loading ? '' : pagos?.apoyoPct}</div>
          </div>
        </div>

        <div className="pagos-links">
          <div className="pagos-link" style={{cursor:'pointer'}} onClick={() => setShowBancos(true)}>
            <div className="pagos-link-icon" style={{display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#ef4444,#f97316)',borderRadius:12,width:44,height:44}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <rect x="7" y="7" width="3" height="10"/>
                <rect x="11" y="10" width="3" height="7"/>
                <rect x="15" y="13" width="3" height="4"/>
              </svg>
            </div>
            <div className="pagos-link-info">
              <div className="pagos-link-title">Bancos para pago</div>
              <div className="pagos-link-desc">Ver cuentas bancarias disponibles</div>
            </div>
            <span className="arrow">→</span>
          </div>
          <div className="pagos-link" style={{cursor:'pointer'}} onClick={() => setShowFacturacion(true)}>
            <div className="pagos-link-icon" style={{display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#f97316,#ea580c)',borderRadius:12,width:44,height:44}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
                <line x1="8" y1="9" x2="10" y2="9"/>
              </svg>
            </div>
            <div className="pagos-link-info">
              <div className="pagos-link-title">Información de facturación</div>
              <div className="pagos-link-desc">Fechas y periodos de pago</div>
            </div>
            <span className="arrow">→</span>
          </div>
        </div>

        <button className="descargar-btn" onClick={handleDescargar}>
          ⬇ Descargar estado de cuenta en PDF
        </button>

        {descargado && (
          <div className="descarga-ok">
            ✅ Estado de cuenta descargado correctamente
          </div>
        )}

        {movimientos.length > 0 && (
          <div className="movimientos">
            <h3>Movimientos recientes</h3>
            {movimientos.map(m => (
              <div className="movimiento" key={m.id}>
                <div>
                  <div className="mov-titulo">{m.titulo || m.concepto || '-'}</div>
                  <div className="mov-fecha">{m.fecha}</div>
                </div>
                <div className="mov-monto">${m.monto}</div>
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

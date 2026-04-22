import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FavoritoBtn from '../components/FavoritoBtn'
import BottomNav from '../components/BottomNav'
import './Transporte.css'

const RUTAS = [
  { nombre: 'Ruta Capu' },
  { nombre: 'Prolongación Reforma' },
  { nombre: 'Ruta Paseo Bravo' },
  { nombre: 'Ruta Puebla' },
  { nombre: 'Ruta Circuito' },
]

const HORARIOS = {
  'Ruta Capu': {
    paradas: [
      { id: 'A', nombre: 'Estacionamiento 1',             h: ['06:00','07:30','14:00','17:30','19:30'] },
      { id: 'B', nombre: 'Colegio Ignacio Bernal',         h: ['06:01','07:31','14:01','17:31','19:31'] },
      { id: 'C', nombre: 'Estacionamiento 5',              h: ['06:02','07:32','14:02','17:32','19:32'] },
      { id: 'D', nombre: 'Gimnasio MOE Williams',          h: ['06:04','07:34','14:04','17:34','19:34'] },
      { id: 'E', nombre: 'Salida Principal UDLAP',         h: ['06:05','07:35','14:05','17:35','19:35'] },
      { id: '1', nombre: 'Recta Cholula y 31 Poniente',    h: ['06:10','07:40','14:10','17:40','19:40'] },
      { id: '2', nombre: 'Blvd. Norte y Periférico',       h: ['06:15','07:45','14:15','17:45','19:45'] },
      { id: '3', nombre: '14 Oriente y 5 de Mayo',         h: ['06:20','07:50','14:20','17:50','19:50'] },
      { id: '4', nombre: 'Lázaro Cárdenas y 16 Sep.',      h: ['06:24','07:54','14:24','17:54','19:54'] },
      { id: '5', nombre: '16 de Septiembre y CAPU',        h: ['06:27','07:57','14:27','17:57','19:57'] },
      { id: '6', nombre: 'CAPU',                           h: ['06:30','08:00','14:30','18:00','20:00'] },
    ],
  },
  'Prolongación Reforma': {
    paradas: [
      { id: 'A', nombre: 'Estacionamiento 1',              h: ['06:00','07:30','14:00','17:30','19:30'] },
      { id: 'B', nombre: 'Salida Principal UDLAP',         h: ['06:02','07:32','14:02','17:32','19:32'] },
      { id: '1', nombre: 'Recta Cholula y Periférico',     h: ['06:10','07:40','14:10','17:40','19:40'] },
      { id: '2', nombre: 'Periférico Ecológico Norte',     h: ['06:14','07:44','14:14','17:44','19:44'] },
      { id: '3', nombre: 'Blvd. del Norte y Periférico',   h: ['06:17','07:47','14:17','17:47','19:47'] },
      { id: '4', nombre: 'Prol. Reforma y Periférico',     h: ['06:21','07:51','14:21','17:51','19:51'] },
      { id: '5', nombre: 'Prol. Reforma y Bulevar',        h: ['06:24','07:54','14:24','17:54','19:54'] },
      { id: '6', nombre: 'Plaza Crystal',                  h: ['06:27','07:57','14:27','17:57','19:57'] },
      { id: '7', nombre: 'Universidad y Reforma',          h: ['06:30','08:00','14:30','18:00','20:00'] },
      { id: '8', nombre: 'Reforma y Juárez',               h: ['06:33','08:03','14:33','18:03','20:03'] },
      { id: '9', nombre: 'Centro Histórico',               h: ['06:38','08:08','14:38','18:08','20:08'] },
    ],
  },
  'Ruta Paseo Bravo': {
    paradas: [
      { id: 'A', nombre: 'Estacionamiento 1',              h: ['06:05','07:35','14:05','17:35','19:35'] },
      { id: 'B', nombre: 'Salida Principal UDLAP',         h: ['06:07','07:37','14:07','17:37','19:37'] },
      { id: '1', nombre: 'Recta Cholula y 11 Sur',         h: ['06:14','07:44','14:14','17:44','19:44'] },
      { id: '2', nombre: '11 Sur y 31 Poniente',           h: ['06:17','07:47','14:17','17:47','19:47'] },
      { id: '3', nombre: '11 Sur y 15 Poniente',           h: ['06:19','07:49','14:19','17:49','19:49'] },
      { id: '4', nombre: '5 de Mayo y 15 Poniente',        h: ['06:22','07:52','14:22','17:52','19:52'] },
      { id: '5', nombre: 'Av. Juárez y 5 de Mayo',         h: ['06:25','07:55','14:25','17:55','19:55'] },
      { id: '6', nombre: 'Paseo Bravo y Morelos',          h: ['06:28','07:58','14:28','17:58','19:58'] },
      { id: '7', nombre: 'Parque Paseo Bravo',             h: ['06:32','08:02','14:32','18:02','20:02'] },
    ],
  },
  'Ruta Puebla': {
    paradas: [
      { id: 'A',  nombre: 'Estacionamiento 1',                          h: ['06:00','07:30','14:15','17:40','20:00'] },
      { id: 'B',  nombre: 'Colegio Ignacio Bernal',                     h: ['06:01','07:31','14:16','17:41','20:01'] },
      { id: 'C',  nombre: 'Estacionamiento 5',                          h: ['06:02','07:32','14:17','17:42','20:02'] },
      { id: 'D',  nombre: 'Gimnasio Morris "Moe" Williams',             h: ['06:04','07:34','14:19','17:44','20:04'] },
      { id: 'E',  nombre: 'Salida Principal UDLAP',                     h: ['06:05','07:35','14:20','17:45','20:05'] },
      { id: '1',  nombre: 'Recta y Aljojuca',                           h: ['06:12','07:42','14:27','17:52','20:12'] },
      { id: '2',  nombre: 'Rosendo Márquez (SCT)',                      h: ['06:14','07:44','14:29','17:54','20:14'] },
      { id: '3',  nombre: 'Rosendo Márquez y 21 Poniente',              h: ['06:15','07:45','14:30','17:55','20:15'] },
      { id: '4',  nombre: '25 Poniente Telmex',                         h: ['06:16','07:46','14:31','17:56','20:16'] },
      { id: '5',  nombre: '25 Poniente y 35 Sur',                       h: ['06:17','07:47','14:32','17:57','20:17'] },
      { id: '6',  nombre: '31 Sur y 29 Poniente',                       h: ['06:20','07:50','14:35','18:00','20:20'] },
      { id: '7',  nombre: '31 Poniente y 29 Sur',                       h: ['06:21','07:51','14:36','18:01','20:21'] },
      { id: '8',  nombre: '31 Poniente y 23 Sur',                       h: ['06:22','07:52','14:37','18:02','20:22'] },
      { id: '9',  nombre: '31 Poniente y 17 Sur',                       h: ['06:24','07:54','14:39','18:04','20:24'] },
      { id: '10', nombre: '31 Poniente y 13 Sur',                       h: ['06:25','07:55','14:40','18:05','20:25'] },
      { id: '11', nombre: '31 Poniente y 9 Sur',                        h: ['06:26','07:56','14:41','18:06','20:26'] },
      { id: '12', nombre: '7 Sur y 35 Poniente',                        h: ['06:27','07:57','14:42','18:07','20:27'] },
      { id: '13', nombre: '7 Sur y 41 Poniente',                        h: ['06:28','07:58','14:43','18:08','20:28'] },
      { id: '14', nombre: '43 Poniente y 5B Sur',                       h: ['06:29','07:59','14:44','18:09','20:29'] },
      { id: '15', nombre: '43 Poniente y 16 de Septiembre',             h: ['06:30','08:00','14:45','18:10','20:30'] },
      { id: '16', nombre: '43 Oriente y Blvd. 5 de Mayo',               h: ['06:32','08:02','14:47','18:12','20:32'] },
      { id: '17', nombre: 'Av. Sánchez Pontón y Díaz Ordaz',            h: ['06:33','08:03','14:48','18:13','20:33'] },
      { id: '18', nombre: '39 Oriente y 12A Sur',                       h: ['06:35','08:05','14:50','18:15','20:35'] },
      { id: '19', nombre: '14 Sur y 33A Oriente',                       h: ['06:38','08:08','14:53','18:18','20:38'] },
      { id: '20', nombre: '31 Oriente y 8 Sur',                         h: ['06:40','08:10','14:55','18:20','20:40'] },
      { id: '21', nombre: '27 Oriente y Blvd. 5 de Mayo',               h: ['06:41','08:11','14:56','18:21','20:41'] },
      { id: '22', nombre: '23 Oriente y 2 Sur',                         h: ['06:45','08:15','15:00','18:25','20:45'] },
      { id: '23', nombre: '23 Poniente y 3 Sur',                        h: ['06:46','08:16','15:01','18:26','20:46'] },
      { id: '24', nombre: '23 Poniente y 9 Sur',                        h: ['06:47','08:17','15:02','18:27','20:47'] },
      { id: '25', nombre: '23 Poniente y 13 Sur',                       h: ['06:48','08:18','15:03','18:28','20:48'] },
      { id: '26', nombre: '23 Poniente y 17 Sur',                       h: ['06:49','08:19','15:04','18:29','20:49'] },
      { id: '27', nombre: '23 Poniente y 23 Sur',                       h: ['06:51','08:21','15:06','18:31','20:51'] },
      { id: '28', nombre: '25 Sur y 25 Poniente',                       h: ['06:53','08:23','15:08','18:33','20:53'] },
      { id: '29', nombre: '25 Sur y 31 Poniente',                       h: ['06:56','08:26','15:11','18:36','20:56'] },
      { id: '30', nombre: 'Circuito Juan Pablo II y 29 Sur',            h: ['06:59','08:29','15:14','18:39','20:59'] },
      { id: '31', nombre: 'Circuito Juan Pablo II y Diag. 19 Pte.',     h: ['07:01','08:31','15:15','18:41','21:01'] },
      { id: '32', nombre: '43 Sur y 25 Poniente',                       h: ['07:07','08:37','15:21','18:47','21:07'] },
      { id: '33', nombre: 'R. Márquez y 21 Poniente',                   h: ['07:08','08:38','15:22','18:48','21:08'] },
      { id: '34', nombre: 'R. Márquez y Chalchicomula (SCT)',            h: ['07:09','08:39','15:23','18:49','21:09'] },
      { id: '35', nombre: 'Recta y Av. Aljojuca',                       h: ['07:11','08:41','15:25','18:51','21:11'] },
      { id: 'A',  nombre: 'Estacionamiento 1',                          h: ['07:21','08:51','15:35','19:01','21:21'] },
    ],
  },
  'Ruta Circuito': {
    paradas: [
      { id: 'A', nombre: 'Estacionamiento 1',                h: ['06:00','07:30','13:30','17:00','19:00'] },
      { id: 'B', nombre: 'Estacionamiento 5',                h: ['06:02','07:32','13:32','17:02','19:02'] },
      { id: 'C', nombre: 'Salida Principal UDLAP',           h: ['06:04','07:34','13:34','17:04','19:04'] },
      { id: '1', nombre: 'Recta Cholula y Circuito',         h: ['06:08','07:38','13:38','17:08','19:08'] },
      { id: '2', nombre: 'Circuito Juan Pablo II Sur',       h: ['06:12','07:42','13:42','17:12','19:12'] },
      { id: '3', nombre: 'Circuito Juan Pablo II Poniente',  h: ['06:15','07:45','13:45','17:15','19:15'] },
      { id: '4', nombre: '43 Sur y Circuito',                h: ['06:19','07:49','13:49','17:19','19:19'] },
      { id: '5', nombre: '25 Sur y Circuito Norte',          h: ['06:22','07:52','13:52','17:22','19:22'] },
      { id: '6', nombre: 'Circuito y Recta Cholula',         h: ['06:26','07:56','13:56','17:26','19:26'] },
      { id: 'A', nombre: 'Estacionamiento 1',                h: ['06:30','08:00','14:00','17:30','19:30'] },
    ],
  },
}

export default function Transporte() {
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(null)
  const [horarioAbierto, setHorarioAbierto] = useState(null)

  const toggle = (key) => setAbierto(abierto === key ? null : key)

  const datos = horarioAbierto ? HORARIOS[horarioAbierto] : null

  return (
    <div className="transporte-screen">
      {/* ── Horario overlay ── */}
      {horarioAbierto && datos && (
        <div className="horario-overlay">
          <div className="horario-ov-header">
            <button className="horario-ov-close" onClick={() => setHorarioAbierto(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="22" height="22">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="horario-ov-titles">
              <span className="horario-ov-sub">Rutas de transporte</span>
              <span className="horario-ov-nombre">{horarioAbierto.toUpperCase()}</span>
            </div>
          </div>

          <div className="horario-tabla-wrap">
            <table className="horario-tabla">
              <thead>
                <tr>
                  <th colSpan="2" className="th-paradas">Paradas</th>
                  <th colSpan="5" className="th-horarios">Horarios</th>
                </tr>
              </thead>
              <tbody>
                {datos.paradas.map((p, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'hrow-even' : 'hrow-odd'}>
                    <td className="hcol-id">{p.id}</td>
                    <td className="hcol-nombre">{p.nombre}</td>
                    {p.h.map((t, j) => (
                      <td key={j} className="hcol-hora">{t}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Main screen ── */}
      <div className="transporte-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
          <button className="header-back-btn" style={{margin:0}} onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <FavoritoBtn ruta="/transporte" />
        </div>
        <h1>Transporte UDLAP</h1>
      </div>

      <div className="transporte-content">
        <div className="transporte-seccion-label">VIDA ESTUDIANTIL</div>
        <p className="transporte-desc">
          Para hacer uso del servicio de transporte UDLAP, es necesario presentar tu credencial institucional vigente y el boleto o bono de autobús vigente del periodo.
        </p>

        {/* Puntos de venta */}
        <div className="acordeon-card" onClick={() => toggle('puntos')}>
          <div className="acordeon-header">
            <span className="acordeon-titulo">Puntos de venta</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#e07040" strokeWidth="2.5" width="20" height="20"
              style={{transform: abierto === 'puntos' ? 'rotate(180deg)' : 'none', transition:'0.2s'}}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          {abierto === 'puntos' && (
            <div className="acordeon-body">
              {[
                {
                  nombre: 'Tienda universitaria',
                  desc: 'Venta de boletos y bono de autobús',
                  lugar: 'Centro estudiantil.',
                  horario: 'Lunes a viernes de 09:00 a 19:00 h\nSábado de 09:00 a 13:00 h\nDomingo cerrado.',
                },
                {
                  nombre: 'Dominicana',
                  desc: 'Venta de boletos de autobús',
                  lugar: 'MOE-1 junto a las canchas de tenis.',
                  horario: 'Lunes a viernes de 07:00 a 18:00 h\nSábado de 09:00 a 14:00 h\nDomingo cerrado.',
                },
                {
                  nombre: 'Círculo K',
                  desc: 'Venta de boletos de autobús',
                  lugar: 'Ágora (Ag-1) y Centro Estudiantil (CE-3).',
                  horario: 'Lunes a domingo 24 h.',
                },
              ].map((p, i) => (
                <div key={i} className="punto-venta">
                  <div className="punto-nombre">{p.nombre}</div>
                  <div className="punto-desc">{p.desc}</div>
                  <div className="punto-fila">
                    <svg viewBox="0 0 24 24" fill="#0d9488" width="22" height="22"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
                    <span>{p.lugar}</span>
                  </div>
                  <div className="punto-fila" style={{alignItems:'flex-start'}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span style={{whiteSpace:'pre-line'}}>{p.horario}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rutas universitarias */}
        <div className="acordeon-card" onClick={() => toggle('rutas')}>
          <div className="acordeon-header">
            <span className="acordeon-titulo">Rutas universitarias</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#e07040" strokeWidth="2.5" width="20" height="20"
              style={{transform: abierto === 'rutas' ? 'rotate(180deg)' : 'none', transition:'0.2s'}}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          {abierto === 'rutas' && (
            <div className="acordeon-body" onClick={e => e.stopPropagation()}>
              {RUTAS.map((r, i) => (
                <div className="ruta-nueva-card" key={i}>
                  <div className="ruta-nueva-nombre">{r.nombre}</div>
                  <button className="ruta-btn-horarios" onClick={e => { e.stopPropagation(); setHorarioAbierto(r.nombre) }}>
                    Ver horarios
                  </button>
                  <button className="ruta-btn-ruta">Ver ruta</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{height: 80}} />
      <BottomNav />
    </div>
  )
}

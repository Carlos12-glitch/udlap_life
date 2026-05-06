import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import FavoritoBtn from '../components/FavoritoBtn'
import BottomNav from '../components/BottomNav'
import './Transporte.css'

// Todos los horarios y paradas están hardcodeados — no hay colección Firestore para transporte.
// Si los horarios cambian por semestre, editar HORARIOS directamente.
const RUTAS = [
  { nombre: 'Ruta Capu' },
  { nombre: 'Prolongación Reforma' },
  { nombre: 'Ruta Paseo Bravo' },
  { nombre: 'Ruta Puebla' },
  { nombre: 'Ruta Circuito' },
]

const STOP_ICON = L.divIcon({
  className: '',
  html: `<svg width="22" height="30" viewBox="0 0 22 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0C4.925 0 0 4.925 0 11c0 8.25 11 19 11 19s11-10.75 11-19C22 4.925 17.075 0 11 0z" fill="#e07040" stroke="white" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="4.5" fill="white"/>
  </svg>`,
  iconSize: [22, 30],
  iconAnchor: [11, 30],
  popupAnchor: [0, -30],
})

const RUTA_MAPA = {
  'Ruta Puebla': {
    center: [19.0553, -98.2833],
    zoom: 14,
    paradas: [
      { id: 'A', nombre: 'Estacionamiento 1 (UDLAP)',           coords: [19.0553, -98.2833] },
      { id: 'B', nombre: 'Colegio Ignacio Bernal',              coords: [19.0566, -98.2842] },
      { id: 'C', nombre: 'Estacionamiento 5',                   coords: [19.0555, -98.2858] },
      { id: 'D', nombre: 'Gimnasio Morris "Moe" Williams',      coords: [19.0573, -98.2862] },
      { id: 'E', nombre: 'Salida Principal UDLAP',              coords: [19.0537, -98.2830] },
      { id: '1', nombre: 'Recta y Aljojuca',                    coords: [19.0640, -98.2635] },
      { id: '2', nombre: 'Rosendo Márquez (SCT)',               coords: [19.0490, -98.2515] },
      { id: '6', nombre: '31 Sur y 29 Poniente',                coords: [19.0420, -98.2280] },
      { id: '15', nombre: '43 Poniente y 16 de Septiembre',     coords: [19.0430, -98.2200] },
      { id: '16', nombre: '43 Oriente y Blvd. 5 de Mayo',       coords: [19.0440, -98.2070] },
      { id: '22', nombre: '23 Oriente y 2 Sur',                 coords: [19.0440, -98.2050] },
      { id: '30', nombre: 'Circuito Juan Pablo II y 29 Sur',    coords: [19.0355, -98.2295] },
      { id: '35', nombre: 'Recta y Av. Aljojuca (regreso)',     coords: [19.0640, -98.2635] },
    ],
    polyline: [
      [19.0553, -98.2833],
      [19.0566, -98.2842],
      [19.0555, -98.2858],
      [19.0573, -98.2862],
      [19.0585, -98.2855],
      [19.0600, -98.2845],
      [19.0635, -98.2820],
      [19.0645, -98.2760],
      [19.0640, -98.2635],
      [19.0490, -98.2515],
      [19.0480, -98.2480],
      [19.0460, -98.2390],
      [19.0440, -98.2310],
      [19.0420, -98.2280],
      [19.0415, -98.2250],
      [19.0420, -98.2210],
      [19.0430, -98.2200],
      [19.0440, -98.2140],
      [19.0440, -98.2070],
      [19.0445, -98.2050],
      [19.0440, -98.2050],
      [19.0435, -98.2080],
      [19.0430, -98.2120],
      [19.0420, -98.2180],
      [19.0400, -98.2230],
      [19.0370, -98.2270],
      [19.0355, -98.2295],
      [19.0380, -98.2320],
      [19.0420, -98.2350],
      [19.0470, -98.2480],
      [19.0490, -98.2515],
      [19.0640, -98.2635],
      [19.0645, -98.2760],
      [19.0635, -98.2820],
      [19.0600, -98.2845],
      [19.0585, -98.2855],
      [19.0540, -98.2825],
      [19.0537, -98.2830],
      [19.0553, -98.2833],
    ],
  },
  'Ruta Capu': {
    center: [19.0553, -98.2833],
    zoom: 13,
    paradas: [
      { id: 'A', nombre: 'Estacionamiento 1 (UDLAP)', coords: [19.0553, -98.2833] },
      { id: 'E', nombre: 'Salida Principal UDLAP',    coords: [19.0537, -98.2830] },
      { id: '1', nombre: 'Recta Cholula y 31 Poniente', coords: [19.0640, -98.2640] },
      { id: '2', nombre: 'Blvd. Norte y Periférico',  coords: [19.0760, -98.2560] },
      { id: '6', nombre: 'CAPU',                      coords: [19.0870, -98.2380] },
    ],
    polyline: [
      [19.0553, -98.2833],
      [19.0537, -98.2830],
      [19.0640, -98.2640],
      [19.0760, -98.2560],
      [19.0820, -98.2480],
      [19.0870, -98.2380],
    ],
  },
  'Prolongación Reforma': {
    center: [19.0553, -98.2833],
    zoom: 13,
    paradas: [
      { id: 'A', nombre: 'Estacionamiento 1 (UDLAP)', coords: [19.0553, -98.2833] },
      { id: 'B', nombre: 'Salida Principal UDLAP',    coords: [19.0537, -98.2830] },
      { id: '1', nombre: 'Recta Cholula y Periférico', coords: [19.0640, -98.2640] },
      { id: '7', nombre: 'Universidad y Reforma',     coords: [19.0530, -98.2210] },
      { id: '9', nombre: 'Centro Histórico',          coords: [19.0425, -98.1980] },
    ],
    polyline: [
      [19.0553, -98.2833],
      [19.0537, -98.2830],
      [19.0640, -98.2640],
      [19.0640, -98.2450],
      [19.0590, -98.2350],
      [19.0530, -98.2210],
      [19.0480, -98.2090],
      [19.0425, -98.1980],
    ],
  },
  'Ruta Paseo Bravo': {
    center: [19.0553, -98.2833],
    zoom: 13,
    paradas: [
      { id: 'A', nombre: 'Estacionamiento 1 (UDLAP)', coords: [19.0553, -98.2833] },
      { id: 'B', nombre: 'Salida Principal UDLAP',    coords: [19.0537, -98.2830] },
      { id: '1', nombre: 'Recta Cholula y 11 Sur',    coords: [19.0610, -98.2680] },
      { id: '6', nombre: 'Paseo Bravo y Morelos',     coords: [19.0450, -98.2060] },
      { id: '7', nombre: 'Parque Paseo Bravo',        coords: [19.0440, -98.2040] },
    ],
    polyline: [
      [19.0553, -98.2833],
      [19.0537, -98.2830],
      [19.0610, -98.2680],
      [19.0570, -98.2550],
      [19.0520, -98.2350],
      [19.0480, -98.2180],
      [19.0450, -98.2060],
      [19.0440, -98.2040],
    ],
  },
  'Ruta Circuito': {
    center: [19.0510, -98.2820],
    zoom: 15,
    paradas: [
      { id: 'A', nombre: 'Estacionamiento 1 (UDLAP)', coords: [19.0553, -98.2833] },
      { id: 'B', nombre: 'Estacionamiento 5',         coords: [19.0555, -98.2858] },
      { id: 'C', nombre: 'Salida Principal UDLAP',    coords: [19.0537, -98.2830] },
      { id: '1', nombre: 'Recta Cholula y Circuito',  coords: [19.0600, -98.2780] },
      { id: '2', nombre: 'Circuito Juan Pablo II Sur', coords: [19.0480, -98.2780] },
      { id: '4', nombre: '43 Sur y Circuito',         coords: [19.0455, -98.2820] },
      { id: '6', nombre: 'Circuito y Recta Cholula',  coords: [19.0600, -98.2870] },
    ],
    polyline: [
      [19.0553, -98.2833],
      [19.0555, -98.2858],
      [19.0537, -98.2830],
      [19.0560, -98.2810],
      [19.0600, -98.2780],
      [19.0560, -98.2780],
      [19.0510, -98.2785],
      [19.0480, -98.2780],
      [19.0470, -98.2800],
      [19.0455, -98.2820],
      [19.0465, -98.2860],
      [19.0510, -98.2880],
      [19.0560, -98.2880],
      [19.0600, -98.2870],
      [19.0580, -98.2855],
      [19.0553, -98.2833],
    ],
  },
}

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
  const [rutaMapAbierta, setRutaMapAbierta] = useState(null)

  const toggle = (key) => setAbierto(abierto === key ? null : key)

  const datos = horarioAbierto ? HORARIOS[horarioAbierto] : null

  const mapaData = rutaMapAbierta ? RUTA_MAPA[rutaMapAbierta] : null

  return (
    <div className="transporte-screen">
      {/* ── Ruta mapa overlay ── */}
      {rutaMapAbierta && mapaData && (
        <div className="ruta-mapa-overlay">
          <div className="ruta-mapa-header">
            <button className="horario-ov-close" onClick={() => setRutaMapAbierta(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="22" height="22">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="horario-ov-titles">
              <span className="horario-ov-sub">Rutas de transporte</span>
              <span className="horario-ov-nombre">{rutaMapAbierta.toUpperCase()}</span>
            </div>
          </div>

          <div className="ruta-mapa-contenedor">
            <MapContainer
              key={rutaMapAbierta}
              center={mapaData.center}
              zoom={mapaData.zoom}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline positions={mapaData.polyline} color="#e07040" weight={4} opacity={0.85} />
              {mapaData.paradas.map((p, i) => (
                <Marker key={i} position={p.coords} icon={STOP_ICON}>
                  <Popup>
                    <div style={{ fontFamily: 'sans-serif', minWidth: 130 }}>
                      <strong style={{ fontSize: 12, color: '#e07040' }}>{p.id}</strong>
                      <div style={{ fontSize: 13, color: '#1f2937', marginTop: 2 }}>{p.nombre}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="ruta-mapa-footer">
            <span className="ruta-mapa-hint">Toca un marcador para ver la parada</span>
          </div>
        </div>
      )}

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
                  <button className="ruta-btn-ruta" onClick={e => { e.stopPropagation(); setRutaMapAbierta(r.nombre) }}>Ver ruta</button>
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

// Árbol de rutas de la aplicación. La raíz "/" redirige a "/login" siempre;
// no hay protección de rutas autenticadas — la verificación ocurre dentro de cada página.
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import BiometricAuth from './pages/BiometricAuth'
import BiometricScanning from './pages/BiometricScanning'
import BiometricSuccess from './pages/BiometricSuccess'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Avisos from './pages/Avisos'
import Eventos from './pages/Eventos'
import Escolar from './pages/Escolar'
import Horario from './pages/Horario'
import Calificaciones from './pages/Calificaciones'
import Transcript from './pages/Transcript'
import Pagos from './pages/Pagos'
import Comunidad from './pages/Comunidad'
import Transporte from './pages/Transporte'
import Alimentos from './pages/Alimentos'
import Mapa from './pages/Mapa'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/biometric" element={<BiometricAuth />} />
      <Route path="/biometric/scanning" element={<BiometricScanning />} />
      <Route path="/biometric/success" element={<BiometricSuccess />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/avisos" element={<Avisos />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/escolar" element={<Escolar />} />
      <Route path="/horario" element={<Horario />} />
      <Route path="/calificaciones" element={<Calificaciones />} />
      <Route path="/transcript" element={<Transcript />} />
      <Route path="/pagos" element={<Pagos />} />
      <Route path="/comunidad" element={<Comunidad />} />
      <Route path="/transporte" element={<Transporte />} />
      <Route path="/alimentos" element={<Alimentos />} />
      <Route path="/mapa" element={<Mapa />} />
    </Routes>
  )
}

export default App

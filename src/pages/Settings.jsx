import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { saveCache, loadCache } from '../utils/cache'
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword
} from 'firebase/auth'
import { auth, db, messaging, getToken, onMessage } from '../firebase'
import BottomNav from '../components/BottomNav'
import './Settings.css'

const FONT_SIZES = { Pequeño: '13px', Normal: '16px', Grande: '19px' }

export default function Settings() {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'Normal')
  const [notifPush, setNotifPush] = useState(true)
  const [notifEventos, setNotifEventos] = useState(true)
  const [notifCalif, setNotifCalif] = useState(false)
  const [notifAvisos, setNotifAvisos] = useState(true)
  const [usuario, setUsuario] = useState(() => loadCache('usuario'))
  const [biometrico, setBiometrico] = useState(() => localStorage.getItem('biometrico') === 'true')

  // Password modal state
  const [showPassModal, setShowPassModal] = useState(false)
  const [passActual, setPassActual] = useState('')
  const [passNueva, setPassNueva] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [passError, setPassError] = useState('')
  const [passOk, setPassOk] = useState(false)
  const [passLoading, setPassLoading] = useState(false)

  // Biometric info sheet
  const [showBioSheet, setShowBioSheet] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) {
        const id = user.email.split('@')[0]
        getDoc(doc(db, 'usuarios', id)).then(snap => {
          if (snap.exists()) {
            const raw = snap.data()
            const clean = {}
            Object.entries(raw).forEach(([k, v]) => { clean[k.trim()] = typeof v === 'string' ? v.trim() : v })
            setUsuario(clean)
            saveCache('usuario', clean)
          }
        })
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (darkMode) document.body.classList.add('dark-mode')
    else document.body.classList.remove('dark-mode')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    document.body.classList.remove('font-small', 'font-large')
    if (fontSize === 'Pequeño') document.body.classList.add('font-small')
    if (fontSize === 'Grande') document.body.classList.add('font-large')
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  // Guarda el token FCM en Firestore para uso futuro (ej. envío desde servidor).
  // Las notificaciones actuales usan la Notification API del navegador directamente
  // porque la FCM Legacy API fue deprecada y Cloud Functions requiere plan Blaze.
  async function guardarTokenFCM() {
    try {
      const vapidKey = import.meta.env.VITE_VAPID_KEY
      if (!vapidKey) return
      const token = await getToken(messaging, { vapidKey })
      const user = auth.currentUser
      if (user && token) {
        const id = user.email.split('@')[0]
        await setDoc(doc(db, 'fcm_tokens', id), { token, updated: new Date() }, { merge: true })
      }
    } catch (e) {
      console.error('Error obteniendo token FCM:', e)
    }
  }

  async function activarNotificaciones(valor) {
    setNotifPush(valor)
    if (!valor) return
    if (!('Notification' in window)) { alert('Tu navegador no soporta notificaciones.'); return }

    let permiso = Notification.permission
    if (permiso === 'default') permiso = await Notification.requestPermission()
    if (permiso !== 'granted') { setNotifPush(false); return }

    onMessage(messaging, payload => {
      const { title, body } = payload.notification || {}
      if (title) new Notification(title, { body, icon: '/favicon.svg' })
    })

    await guardarTokenFCM()
    new Notification('UDLAPLife', { body: '¡Notificaciones activadas! Recibirás avisos del campus.', icon: '/favicon.svg' })
  }

  async function enviarNotifPrueba() {
    if (Notification.permission !== 'granted') { await activarNotificaciones(true); return }
    new Notification('UDLAPLife — Prueba', { body: '¡Funciona! Recibirás notificaciones mientras la app esté abierta.', icon: '/favicon.svg' })
  }

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  function abrirCambioContrasena() {
    setPassActual(''); setPassNueva(''); setPassConfirm('')
    setPassError(''); setPassOk(false)
    setShowPassModal(true)
  }

  async function cambiarContrasena() {
    setPassError('')
    if (!passActual || !passNueva || !passConfirm) {
      setPassError('Completa todos los campos.'); return
    }
    if (passNueva.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres.'); return
    }
    if (passNueva !== passConfirm) {
      setPassError('Las contraseñas no coinciden.'); return
    }
    setPassLoading(true)
    try {
      const user = auth.currentUser
      const credential = EmailAuthProvider.credential(user.email, passActual)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, passNueva)
      setPassOk(true)
      setTimeout(() => setShowPassModal(false), 1800)
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setPassError('Contraseña actual incorrecta.')
      } else {
        setPassError('Ocurrió un error. Intenta de nuevo.')
      }
    }
    setPassLoading(false)
  }

  function toggleBiometrico() {
    const nuevo = !biometrico
    setBiometrico(nuevo)
    localStorage.setItem('biometrico', nuevo)
    setShowBioSheet(true)
  }

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1>Configuración</h1>
      </div>

      <div className="settings-user">
        <div className="s-avatar">{iniciales}</div>
        <div>
          <div className="s-name">{usuario?.nombre || 'Cargando...'}</div>
          <div className="s-email">{usuario?.correo || ''}</div>
          <div className="s-id">ID: {usuario?.id || ''}</div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-title">CUENTA</div>
          <div className="settings-card">
            <div className="setting-item" style={{cursor:'pointer'}} onClick={abrirCambioContrasena}>
              <div className="setting-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
              <div className="setting-info">
                <div className="setting-name">Contraseña</div>
                <div className="setting-desc">Cambiar o actualizar contraseña</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="chevron">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
            <div className="setting-item">
              <div className="setting-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 22a10 10 0 110-20 10 10 0 010 20z"/><path d="M12 18a6 6 0 010-12"/><path d="M12 14a2 2 0 010-4"/></svg></div>
              <div className="setting-info">
                <div className="setting-name">Autenticación biométrica</div>
                <div className="setting-desc">{biometrico ? 'Activada — inicio de sesión con biométrico' : 'Desactivada — toca para activar'}</div>
              </div>
              <button className={`toggle ${biometrico ? 'on' : ''}`} onClick={toggleBiometrico} />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">NOTIFICACIONES</div>
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div>
              <div className="setting-info">
                <div className="setting-name">Notificaciones push</div>
                <div className="setting-desc">Recibir notificaciones de la app</div>
              </div>
              <button className={`toggle ${notifPush ? 'on' : ''}`} onClick={() => activarNotificaciones(!notifPush)} />
            </div>
            {[
              { label: 'Nuevos eventos', desc: 'Notificaciones de eventos universitarios', val: notifEventos, set: setNotifEventos },
              { label: 'Actualización de calificaciones', desc: 'Notificaciones cuando se publiquen calificaciones', val: notifCalif, set: setNotifCalif },
              { label: 'Avisos', desc: 'Notificaciones de avisos importantes', val: notifAvisos, set: setNotifAvisos },
            ].map((item, i) => (
              <div className="setting-item" key={i}>
                <div className="setting-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div>
                <div className="setting-info">
                  <div className="setting-name">{item.label}</div>
                  <div className="setting-desc">{item.desc}</div>
                </div>
                <button className={`toggle ${item.val ? 'on' : ''}`} onClick={() => item.set(!item.val)} />
              </div>
            ))}
          </div>
          <button className="notif-prueba-btn" onClick={enviarNotifPrueba}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            Enviar notificación de prueba
          </button>
        </div>

        <div className="settings-section">
          <div className="section-title">APARIENCIA</div>
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></div>
              <div className="setting-info">
                <div className="setting-name">Modo oscuro</div>
                <div className="setting-desc">Alternar tema oscuro</div>
              </div>
              <button className={`toggle ${darkMode ? 'on' : ''}`} onClick={() => setDarkMode(!darkMode)} />
            </div>
            <div className="setting-item">
              <div className="setting-icon">T</div>
              <div className="setting-info">
                <div className="setting-name">Tamaño de letra</div>
                <div className="setting-desc">Ajustar tamaño del texto</div>
              </div>
              <div style={{display:'flex', gap:6}}>
                {Object.keys(FONT_SIZES).map(s => (
                  <button key={s} onClick={() => setFontSize(s)} style={{
                    padding:'4px 10px', borderRadius:8, border:'1.5px solid',
                    borderColor: fontSize === s ? '#f97316' : '#e5e7eb',
                    background: fontSize === s ? '#f97316' : 'transparent',
                    color: fontSize === s ? 'white' : '#6b7280',
                    fontSize:11, cursor:'pointer', fontWeight: fontSize === s ? 700 : 400
                  }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">PRIVACIDAD</div>
          <div className="settings-card">
            <div className="setting-item" style={{cursor:'pointer'}} onClick={() => window.open('https://www.udlap.mx/privacidad/', '_blank')}>
              <div className="setting-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <div className="setting-info">
                <div className="setting-name">Política de privacidad</div>
                <div className="setting-desc">Lee nuestra política de privacidad</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="chevron">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">SOPORTE</div>
          <div className="settings-card">
            <div className="setting-item" style={{cursor:'pointer'}} onClick={() => window.open('https://servicedeskweb.udlap.mx/', '_blank')}>
              <div className="setting-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
              <div className="setting-info">
                <div className="setting-name">Ayuda y soporte</div>
                <div className="setting-desc">Preguntas frecuentes y contacto con soporte</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="chevron">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
            <div className="setting-item">
              <div className="setting-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeWidth="3"/></svg></div>
              <div className="setting-info">
                <div className="setting-name">Acerca de</div>
                <div className="setting-desc">Versión de la app 2.1.0</div>
              </div>
            </div>
          </div>
        </div>

        <p className="app-version">UDLAPLife v2.1.0</p>
        <p className="app-version">© 2026 Universidad. Todos los derechos reservados.</p>
      </div>

      <div style={{height: 80}} />
      <BottomNav />

      {/* ── Modal cambiar contraseña ── */}
      {showPassModal && (
        <div className="modal-overlay" onClick={() => setShowPassModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">Cambiar contraseña</h2>

            {passOk ? (
              <div className="pass-ok">
                <span>✅</span>
                <p>Contraseña actualizada correctamente.</p>
              </div>
            ) : (
              <>
                <div className="modal-field">
                  <label>Contraseña actual</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passActual}
                    onChange={e => setPassActual(e.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label>Nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passNueva}
                    onChange={e => setPassNueva(e.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label>Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passConfirm}
                    onChange={e => setPassConfirm(e.target.value)}
                  />
                </div>
                {passError && <p className="modal-error">{passError}</p>}
                <button
                  className="modal-btn"
                  onClick={cambiarContrasena}
                  disabled={passLoading}
                >
                  {passLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
                <button className="modal-cancel" onClick={() => setShowPassModal(false)}>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Sheet info biométrico ── */}
      {showBioSheet && (
        <div className="modal-overlay" onClick={() => setShowBioSheet(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{textAlign:'center', padding:'8px 0 16px'}}>
              <div style={{fontSize:48, marginBottom:12}}>👆</div>
              <h2 className="modal-title">
                {biometrico ? 'Biométrico activado' : 'Biométrico desactivado'}
              </h2>
              <p style={{fontSize:14, color:'#6b7280', lineHeight:1.5, marginTop:8}}>
                {biometrico
                  ? 'Al iniciar sesión, podrás usar tu huella dactilar o Face ID para autenticarte rápidamente.'
                  : 'La autenticación biométrica ha sido desactivada. Usarás tu contraseña para iniciar sesión.'}
              </p>
            </div>
            <button className="modal-btn" onClick={() => setShowBioSheet(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyBW6kfH-zcl6vrflZu4bURg7nZDtxdlMRY",
  authDomain: "udlaplife.firebaseapp.com",
  projectId: "udlaplife",
  storageBucket: "udlaplife.firebasestorage.app",
  messagingSenderId: "275979284252",
  appId: "1:275979284252:web:0b52dbf04f4a874fe814d9"
})

const messaging = firebase.messaging()

// Muestra la notificación cuando la app está en background o cerrada
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'UDLAPLife'
  const body  = payload.notification?.body  || 'Tienes un nuevo aviso'
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: payload.data,
  })
})

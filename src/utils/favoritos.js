const KEY = 'favoritos'

export const PAGINAS_INFO = {
  '/horario':       { titulo: 'Horario',        color: '#4f46e5' },
  '/calificaciones':{ titulo: 'Calificaciones', color: '#22c55e' },
  '/transcript':    { titulo: 'Transcript',     color: '#7c3aed' },
  '/pagos':         { titulo: 'Pagos',          color: '#059669' },
  '/escolar':       { titulo: 'Escolar',        color: '#0d9488' },
  '/alimentos':     { titulo: 'Alimentos',      color: '#f97316' },
  '/transporte':    { titulo: 'Transporte',     color: '#0891b2' },
  '/mapa':          { titulo: 'Mapa',           color: '#3b82f6' },
  '/comunidad':     { titulo: 'Comunidad',      color: '#8b5cf6' },
}

export function getFavoritos() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export function toggleFavorito(ruta) {
  const favs = getFavoritos()
  const idx = favs.indexOf(ruta)
  if (idx === -1) favs.push(ruta)
  else favs.splice(idx, 1)
  localStorage.setItem(KEY, JSON.stringify(favs))
  return favs
}

export function esFavorito(ruta) {
  return getFavoritos().includes(ruta)
}

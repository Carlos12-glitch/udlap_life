import { useState } from 'react'
import { toggleFavorito, esFavorito } from '../utils/favoritos'

export default function FavoritoBtn({ ruta }) {
  const [fav, setFav] = useState(() => esFavorito(ruta))

  function handleClick() {
    const nuevos = toggleFavorito(ruta)
    setFav(nuevos.includes(ruta))
  }

  return (
    <button
      onClick={handleClick}
      title={fav ? 'Quitar de accesos rápidos' : 'Agregar a accesos rápidos'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <svg viewBox="0 0 24 24" width="22" height="22"
        fill={fav ? '#facc15' : 'none'}
        stroke={fav ? '#facc15' : 'rgba(255,255,255,0.8)'}
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </button>
  )
}

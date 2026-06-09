import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Titik masuk (entry point) aplikasi React.
// Mengambil elemen <div id="root"> di index.html, lalu me-render komponen App
// ke dalamnya. StrictMode = mode bantuan dev untuk mendeteksi potensi masalah.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

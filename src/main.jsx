import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import './index.css'
import App from './App.jsx'

// Titik masuk (entry point) aplikasi React.
// Mengambil elemen <div id="root"> di index.html, lalu me-render komponen App
// ke dalamnya. StrictMode = mode bantuan dev untuk mendeteksi potensi masalah.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider>
      <App />
    </MantineProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import Bands from './pages/Bands.tsx'
import Band from './pages/Band.tsx'
import Admin from './pages/Admin.tsx'
import RegisterBand from './pages/RegisterBand.tsx'
import Privacy from './pages/Privacy.tsx'
import Unregister from './pages/Unregister.tsx'
import DataDeletion from './pages/DataDeletion.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/bands" element={<Bands />} />
        <Route path="/bands/:id" element={<Band />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<RegisterBand />} />
        <Route path="/unregister" element={<Unregister />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
